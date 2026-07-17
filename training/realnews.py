# ==========================================
# CELL 1: IMPORT THƯ VIỆN & CẤU HÌNH HỆ THỐNG
# ==========================================
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import re
from sklearn.feature_extraction.text import CountVectorizer
import warnings

# Cấu hình giao diện đồ thị đồng bộ, chuyên nghiệp
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("viridis")
warnings.filterwarnings('ignore')

# 🛠️ ĐIỂM THAY ĐỔI: Cấu hình hệ thống Font hỗ trợ hiển thị tiếng Việt chuẩn Unicode
# Giải quyết triệt để lỗi hiển thị ô vuông trắng (Đ th) trên môi trường Linux của Kaggle
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False 

print("✅ Môi trường phân tích đã sẵn sàng!")
print("⏳ Đang nạp dữ liệu đã làm sạch...")
from sklearn.model_selection import train_test_split
import pandas as pd
df_augmented = pd.read_csv("df_fakenewsnet_cleaned_ready.csv")
df_cleaned = df_augmented


# ==========================================
# CELL 12 [CẬP NHẬT]: DATASET CHỐNG NHIỄU ẢNH LỖI
# ==========================================

import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from transformers import BertTokenizer
import requests
from PIL import Image
from io import BytesIO
import matplotlib.pyplot as plt

# ==========================================
# CẤU HÌNH THAM SỐ ĐIỀU KHIỂN (HYPERPARAMETERS)
# ==========================================
BATCH_SIZE = 16          # Số lượng mẫu trong mỗi lô (batch)
MAX_LEN = 256            # Độ dài tối đa cho đoạn văn bản (BERT input)
LEARNING_RATE = 2e-5     # Tốc độ học của mô hình
EPOCHS = 5               # Số vòng lặp huấn luyện

print(f"✅ Đã cấu hình: Batch Size = {BATCH_SIZE}, Max Length = {MAX_LEN}")

class MultimodalDataset(Dataset):
    def __init__(self, dataframe, is_train=True, max_len=256):
        self.df = dataframe.reset_index(drop=True)
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.max_len = max_len
        
        if is_train:
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.ColorJitter(brightness=0.2, contrast=0.2),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        else:
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

    def __len__(self): return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        inputs = self.tokenizer(str(row['statement']), add_special_tokens=True, 
                                max_length=self.max_len, padding='max_length', 
                                truncation=True, return_tensors='pt')
        try:
            response = requests.get(row['top_img'], timeout=2) # Giảm thời gian chờ xuống 2s để tránh treo luồng
            image = Image.open(BytesIO(response.content)).convert('RGB')
            img_tensor = self.transform(image)
        except:
            # 🔧 ĐIỂM CẢI TIẾN CHIẾN LƯỢC: Thay vì dùng ảnh đen hoàn toàn (gây trùng lặp nhiễu),
            # ta dùng một ma trận ngẫu nhiên mang phân phối nhiễu chuẩn rất nhỏ để không làm lệch trọng số Batch Normalization
            img_tensor = torch.randn(3, 224, 224) * 0.01
            
        return {
            'input_ids': inputs['input_ids'].flatten(),
            'attention_mask': inputs['attention_mask'].flatten(),
            'image': img_tensor,
            'label': torch.tensor(row['label'], dtype=torch.long)
        }

# Cập nhật lại DataLoader với tập dữ liệu đã tăng cường kích thước
train_df, val_df = train_test_split(df_augmented, test_size=0.2, random_state=42, stratify=df_augmented['label'])
train_loader = DataLoader(MultimodalDataset(train_df, is_train=True), batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(MultimodalDataset(val_df, is_train=False), batch_size=BATCH_SIZE, shuffle=False)

# --------------------------------------------------------

# ==========================================
# CELL 13 [V2 — SEMANTIC ALIGNMENT]: KIẾN TRÚC MÔ HÌNH CÓ BỘ ĐỐI CHIẾU NGỮ NGHĨA
# ==========================================
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import BertModel
import torchvision.models as models

class DualStreamFakeNewsModel(nn.Module):
    """
    Mô hình Đa phương thức V2 — Semantic Alignment (Cosine Similarity).
    Kiến trúc khớp chính xác với trọng số best_model_v2.pth:
      text_projection:  [512, 768]
      image_projection: [512, 2048]
      fc1:              [256, 1025]   (512 + 512 + 1 cosine)
      batch_norm:       [256]
      fc2:              [2, 256]
    """
    def __init__(self):
        super(DualStreamFakeNewsModel, self).__init__()
        
        # 1. NHÁNH TEXT (BERT)
        self.bert = BertModel.from_pretrained('bert-base-uncased')
        self.text_dropout = nn.Dropout(p=0.5)
        self.text_projection = nn.Linear(768, 512)      # Ép text về 512D
        
        # 2. NHÁNH IMAGE (ResNet50)
        resnet = models.resnet50(pretrained=True)
        self.resnet_features = nn.Sequential(*list(resnet.children())[:-1])
        self.image_dropout = nn.Dropout(p=0.5)
        self.image_projection = nn.Linear(2048, 512)    # Ép image về 512D
        
        # 3. LỚP KẾT HỢP (Fusion Layer)
        # Text(512) + Image(512) + Cosine_Sim(1) = 1025
        self.fc1 = nn.Linear(1025, 256)
        self.batch_norm = nn.BatchNorm1d(256)
        self.relu = nn.ReLU()
        self.fusion_dropout = nn.Dropout(p=0.6)
        self.fc2 = nn.Linear(256, 2)

    def forward(self, input_ids, attention_mask, image):
        # --- Xử lý luồng Text ---
        bert_outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        text_features = self.text_dropout(bert_outputs.pooler_output)
        t_proj = self.text_projection(text_features)            # → (B, 512)

        # --- Xử lý luồng Image ---
        image_features = self.resnet_features(image)
        image_features = image_features.view(image_features.size(0), -1)
        image_features = self.image_dropout(image_features)
        i_proj = self.image_projection(image_features)          # → (B, 512)

        # --- SEMANTIC ALIGNMENT (Cosine Similarity) ---
        cos_sim = F.cosine_similarity(t_proj, i_proj, dim=1).unsqueeze(1)  # → (B, 1)

        # --- Gộp 2 luồng kèm điểm đối chiếu ---
        combined_features = torch.cat((t_proj, i_proj, cos_sim), dim=1)    # → (B, 1025)

        # --- Phân loại cuối cùng ---
        x = self.fc1(combined_features)
        x = self.batch_norm(x)
        x = self.relu(x)
        x = self.fusion_dropout(x)
        logits = self.fc2(x)

        return logits, cos_sim

print("✅ Đã cập nhật kiến trúc DualStreamFakeNewsModel V2 với Semantic Alignment!")

# --------------------------------------------------------

# ==========================================
# CELL 14 [CẬP NHẬT V2]: KHỞI TẠO VÀ CẤU HÌNH OPTIMIZER CHỐNG OVERFITTING
# ==========================================
import torch.nn as nn

# 1. Khởi tạo lại mô hình mới nhất từ Cell 13
model = DualStreamFakeNewsModel().to(device)

print("⚙️ Đang thiết lập Mở khóa (Unfreeze) một phần mô hình...")

# 2. Đóng băng (Freeze)
for param in model.bert.parameters(): 
    param.requires_grad = False
for param in model.resnet_features.parameters(): 
    param.requires_grad = False

# 3. Mở khóa 2 tầng cuối của BERT
for param in model.bert.encoder.layer[-2:].parameters():
    param.requires_grad = True

# 4. Mở khóa các tầng Projection mới (Semantic Alignment)
for param in model.text_projection.parameters(): 
    param.requires_grad = True
for param in model.image_projection.parameters(): 
    param.requires_grad = True

# 5. Mở khóa các tầng Fully Connected (fc1, batch_norm, fc2)
for param in model.fc1.parameters(): 
    param.requires_grad = True
for param in model.batch_norm.parameters(): 
    param.requires_grad = True
for param in model.fc2.parameters(): 
    param.requires_grad = True

# Tự động tính toán Class Weights 
total_samples = len(df_cleaned)
fake_count = len(df_cleaned[df_cleaned['label'] == 0])
real_count = len(df_cleaned[df_cleaned['label'] == 1])

weight_fake = total_samples / (2.0 * fake_count)
weight_real = total_samples / (2.0 * real_count)
class_weights = torch.tensor([weight_fake, weight_real], dtype=torch.float).to(device)

# 🛡️ ĐIỂM CẢI TIẾN 3: Thêm Label Smoothing (Làm mềm nhãn 10%)
criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.1)

# 🛡️ ĐIỂM CẢI TIẾN 4: Tăng phạt Weight Decay lên 1e-2 để hãm phanh trọng số
optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=3e-5, weight_decay=1e-2)

# 🛡️ ĐIỂM CẢI TIẾN 5: Đổi sang Cosine Scheduler để hạ nhiệt mô hình mượt mà hơn
EPOCHS = 15
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

print(f"⚖️ Trọng số phạt tự động (Fake / Real): {weight_fake:.2f} / {weight_real:.2f}")
print("🛡️ Đã cấu hình Mô hình V2, Optimizer (Weight Decay 1e-2), và Loss (Label Smoothing) thành công.")

# --------------------------------------------------------

# ==========================================
# CELL 15: ĐỊNH NGHĨA HÀM CHỨC NĂNG
# ==========================================
from tqdm.auto import tqdm
from sklearn.metrics import accuracy_score

def train_one_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    total_loss = 0.0
    for batch in tqdm(dataloader, desc="Training", leave=False):
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        images = batch['image'].to(device)
        labels = batch['label'].to(device)
        
        optimizer.zero_grad() # Xóa gradient cũ
        outputs, cos_sim = model(input_ids, attention_mask, images) # Lan truyền xuôi (Forward)
        
        # === COMBINED LOSS: CrossEntropy + Cosine Alignment ===
        ce_loss = criterion(outputs, labels) # Loss phân loại chính
        
        # Cosine Alignment Loss:
        # label=1 (Real) → target_sim=1.0 → cos_sim nên CAO (ảnh & chữ khớp)
        # label=0 (Fake) → target_sim=0.0 → cos_sim nên THẤP (ảnh & chữ lệch)
        target_sim = labels.float()  # Real(1)→1.0, Fake(0)→0.0
        cos_align_loss = F.mse_loss(cos_sim.squeeze(), target_sim)
        
        # Tổng hợp Loss (α=0.8 cho CE, β=0.2 cho Cosine Alignment)
        loss = 0.8 * ce_loss + 0.2 * cos_align_loss
        
        loss.backward() # Lan truyền ngược (Backward)
        optimizer.step() # Cập nhật trọng số
        
        total_loss += loss.item()
    return total_loss / len(dataloader)

def evaluate_model(model, dataloader, criterion, device):
    model.eval()
    total_loss = 0.0
    all_preds, all_labels = [], []
    with torch.no_grad(): # Tắt tính toán gradient để tiết kiệm RAM
        for batch in tqdm(dataloader, desc="Evaluating", leave=False):
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            images = batch['image'].to(device)
            labels = batch['label'].to(device)
            
            outputs, _ = model(input_ids, attention_mask, images)
            loss = criterion(outputs, labels)
            total_loss += loss.item()
            
            # Lấy vị trí dự đoán cao nhất
            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(labels.cpu().numpy())
            
    acc = accuracy_score(all_labels, all_preds)
    return total_loss / len(dataloader), acc, all_labels, all_preds

print("⚙️ Đã định nghĩa hàm 'train_one_epoch' (Combined Loss) và 'evaluate_model' (V2).")

# --------------------------------------------------------

# ==========================================
# CELL 16 [CẬP NHẬT]: VÒNG LẶP HUẤN LUYỆN (EARLY STOPPING THEO VAL LOSS)
# ==========================================
import torch
import copy

# 🛡️ ĐIỂM SỬA ĐỔI: Tìm kiếm Val Loss NHỎ NHẤT thay vì Val Acc cao nhất
best_val_loss = float('inf') 
best_val_acc_at_min_loss = 0.0 # Lưu kèm Acc để in ra cho đẹp
patience = 5 
epochs_no_improve = 0

# Lưu trữ lịch sử để vẽ biểu đồ ở Cell 17
history = {'train_loss': [], 'val_loss': [], 'val_acc': []}

print("🚀 BẮT ĐẦU HUẤN LUYỆN (GIÁM SÁT SỰ TỰ TIN QUA VAL LOSS)...")

for epoch in range(EPOCHS):
    print(f"\n========== EPOCH {epoch+1}/{EPOCHS} ==========")
    
    # 1. Chạy huấn luyện 1 vòng
    train_loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
    
    # 2. Đánh giá trên tập Validation
    val_loss, val_acc, true_labels, pred_labels = evaluate_model(model, val_loader, criterion, device)
    
    # 3. Lập lịch hạ Learning Rate (Cosine Scheduler)
    scheduler.step()
    
    # 4. Ghi nhận lịch sử để vẽ biểu đồ
    history['train_loss'].append(train_loss)
    history['val_loss'].append(val_loss)
    history['val_acc'].append(val_acc)
    
    print(f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")
    
    # ==========================================
    # 5. LOGIC EARLY STOPPING (Theo Val Loss)
    # ==========================================
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        best_val_acc_at_min_loss = val_acc
        epochs_no_improve = 0 
        
        # Lưu lại cỗ máy tại thời điểm có độ tự tin cao nhất
        torch.save(model.state_dict(), 'best_model.pth')
        print(f"🌟 Kỷ lục mới! Val Loss giảm xuống {best_val_loss:.4f} (Acc: {val_acc:.4f}). Đã lưu trọng số!")
    else:
        epochs_no_improve += 1
        print(f"⚠️ Val Loss tăng lên. Patience: {epochs_no_improve}/{patience}")
    
    if epochs_no_improve >= patience:
        print(f"\n🛑 Đã kích hoạt EARLY STOPPING tại Epoch {epoch+1}!")
        print(f"🏆 Cỗ máy đáng tin cậy nhất đã được bảo toàn ở mức Val Loss: {best_val_loss:.4f} (Accuracy: {best_val_acc_at_min_loss:.4f})")
        break

# --------------------------------------------------------

# ==========================================
# CELL 17: TRỰC QUAN HÓA KẾT QUẢ HUẤN LUYỆN
# ==========================================
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report

# 1. IN BÁO CÁO PHÂN LOẠI CỦA EPOCH CUỐI CÙNG
print("\n🎉 BÁO CÁO PHÂN LOẠI CHI TIẾT CỦA EPOCH CUỐI:")
print(classification_report(true_labels, pred_labels, target_names=['Fake News (0)', 'Real News (1)']))

# 2. VẼ BIỂU ĐỒ ĐƯỜNG (LEARNING CURVES)
epochs_range = range(1, len(history['train_loss']) + 1)

plt.figure(figsize=(14, 5))

# Biểu đồ Mất mát (Loss)
plt.subplot(1, 2, 1)
plt.plot(epochs_range, history['train_loss'], label='Train Loss', marker='o', color='#3498db')
plt.plot(epochs_range, history['val_loss'], label='Val Loss', marker='s', color='#e74c3c')
plt.title('Biểu đồ Hàm Mất Mát (Loss)', fontweight='bold')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.6)

# Biểu đồ Độ chính xác (Accuracy)
plt.subplot(1, 2, 2)
plt.plot(epochs_range, history['val_acc'], label='Validation Accuracy', marker='^', color='#2ecc71')
plt.title('Biểu đồ Độ Chính Xác (Accuracy)', fontweight='bold')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.6)

plt.tight_layout()
plt.show()

# --------------------------------------------------------

# ==========================================
# CELL 18: ĐÁNH GIÁ CHUNG CUỘC MÔ HÌNH XỊN NHẤT
# ==========================================
import torch
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

print("🔍 ĐANG KHỞI ĐỘNG CHẾ ĐỘ NGHIỆM THU TỔNG THỂ...")

# 1. Nạp lại trọng số của epoch có kết quả tốt nhất
model.load_state_dict(torch.load('best_model.pth'))
model.eval()

all_preds = []
all_true_labels = []

# Đánh giá trên tập Validation/Test
with torch.no_grad():
    for batch in val_loader: # Nếu bạn có test_loader, hãy đổi tên ở đây
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        images = batch['image'].to(device)
        labels = batch['label'].to(device)
        
        logits, _ = model(input_ids, attention_mask, images)
        preds = torch.argmax(logits, dim=1).cpu().numpy()
        
        all_preds.extend(preds)
        all_true_labels.extend(labels.cpu().numpy())

# 2. In Báo cáo Phân loại
print("\n🎉 BÁO CÁO PHÂN LOẠI CUỐI CÙNG (CHUNG CUỘC):")
print(classification_report(all_true_labels, all_preds, target_names=['Fake News (0)', 'Real News (1)']))

# 3. Vẽ Ma trận Nhầm lẫn (Confusion Matrix)
cm = confusion_matrix(all_true_labels, all_preds)
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Fake', 'Real'], yticklabels=['Fake', 'Real'])
plt.title('Ma Trận Nhầm Lẫn (Confusion Matrix)', fontweight='bold')
plt.xlabel('Mô Hình Dự Đoán')
plt.ylabel('Thực Tế')
plt.show()

# --------------------------------------------------------

# ==========================================
# CELL 19: HỆ THỐNG DỰ ĐOÁN TIN TỨC THỰC TẾ (INFERENCE)
# ==========================================
import torch
import torch.nn.functional as F
import requests
from PIL import Image
from io import BytesIO
from torchvision import transforms
from transformers import BertTokenizer
import re

# 1. Chuẩn bị công cụ tiền xử lý độc lập
inference_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def predict_news(title, text, image_url, model, device, max_len=256):
    """
    Hàm đưa ra phán quyết về một bài báo mới tinh.
    """
    model.eval()
    
    # Bước 1: Làm sạch và cắt ngữ cảnh thông minh (Smart Truncation)
    title = re.sub(r'<.*?>|http\S+|www\.\S+', '', str(title)).strip()
    text = re.sub(r'<.*?>|http\S+|www\.\S+', '', str(text)).strip()
    words = text.split()
    if len(words) > 220:
        cleaned_text = " ".join(words[:140]) + " ... " + " ".join(words[-80:])
    else:
        cleaned_text = text
    statement = f"{title}. {cleaned_text}"
    
    # Bước 2: Tokenize chữ
    inputs = inference_tokenizer(statement, add_special_tokens=True, max_length=max_len, 
                                 padding='max_length', truncation=True, return_tensors='pt')
    
    # Bước 3: Tải và chuyển Tensor ảnh
    try:
        response = requests.get(image_url, timeout=3)
        img = Image.open(BytesIO(response.content)).convert('RGB')
        img_tensor = inference_transform(img).unsqueeze(0) # Thêm chiều Batch = 1
    except:
        print("⚠️ Cảnh báo: Lỗi tải ảnh, hệ thống sẽ sử dụng nhiễu giả định để đánh giá phần chữ.")
        img_tensor = (torch.randn(3, 224, 224) * 0.01).unsqueeze(0)
        
    # Bước 4: Đẩy vào mô hình suy luận
    input_ids = inputs['input_ids'].to(device)
    attention_mask = inputs['attention_mask'].to(device)
    image = img_tensor.to(device)
    
    with torch.no_grad():
        logits, cos_sim_out = model(input_ids, attention_mask, image)
        probs = F.softmax(logits, dim=1).cpu().numpy()[0]
        cos_val = cos_sim_out[0][0].item()
        
    # Bước 5: Trả kết quả trực quan
    is_real = np.argmax(probs) == 1
    confidence = probs[1] if is_real else probs[0]
    label_text = "TIN THẬT 🟢" if is_real else "TIN GIẢ 🔴"
    
    print("\n" + "="*50)
    print(f"BÁO CÁO KIỂM DUYỆT (TRUTHGUARD SCANNER V2)")
    print("="*50)
    print(f"Tiêu đề: {title[:80]}...")
    print("-" * 50)
    print(f"Phán Quyết: {label_text}")
    print(f"Độ tự tin:  {confidence * 100:.2f}%")
    print(f"Chi tiết Xác suất: Fake ({probs[0]*100:.1f}%) | Real ({probs[1]*100:.1f}%)")
    print(f"Cosine Similarity: {cos_val:.4f}")
    print("="*50)


# ==========================================
# THỬ NGHIỆM TRỰC TIẾP
# ==========================================
# Bạn có thể tự copy một bài báo thực tế để test. Dưới đây là dữ liệu giả lập:

test_title = "President signs new bold executive order sweeping healthcare reforms"
test_text = "In a stunning move on Friday, the President signed an executive order that completely overhauls the current healthcare system. The new policies aim to drastically reduce prescription drug prices and ensure coverage for pre-existing conditions. Critics argue it bypasses congress, but supporters rally behind the immediate action."
test_image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/President_Barack_Obama_signs_health_care_reform_legislation.jpg/800px-President_Barack_Obama_signs_health_care_reform_legislation.jpg"

predict_news(test_title, test_text, test_image_url, model, device)

# --------------------------------------------------------

# ==========================================
# CELL 16 [ĐÃ VÁ LỖI LOGIC]: KIỂM THỬ THỰC TẾ "IN-THE-WILD"
# ==========================================
import torch
import torch.nn.functional as F
from PIL import Image
import requests
from io import BytesIO

def predict_real_world_news(title, image_url, model, tokenizer, transform, device):
    model.eval()
    clean_title = advanced_preprocessing(title)
    
    inputs = tokenizer(
        clean_title, 
        add_special_tokens=True, 
        max_length=256, 
        padding='max_length', 
        truncation=True, 
        return_tensors='pt'
    ).to(device)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36'
    }
    
    try:
        response = requests.get(image_url, headers=headers, timeout=5)
        response.raise_for_status() 
        image = Image.open(BytesIO(response.content)).convert('RGB')
        img_tensor = transform(image).unsqueeze(0).to(device) 
        print("📸 Đã tải ảnh thành công!")
    except Exception as e:
        print(f"⚠️ Cảnh báo: Không tải được ảnh do lỗi: {e}")
        img_tensor = (torch.randn(3, 224, 224) * 0.01).unsqueeze(0).to(device)
        
    with torch.no_grad():
        logits, cos_sim_out = model(inputs['input_ids'], inputs['attention_mask'], img_tensor)
        probabilities = F.softmax(logits, dim=1)
        cos_val = cos_sim_out[0][0].item()
        
        # 🔧 ĐÃ SỬA LỖI LOGIC: 0 = Thật (Real), 1 = Giả (Fake)
        prob_real = probabilities[0][0].item() * 100
        prob_fake = probabilities[0][1].item() * 100
        predicted_class = torch.argmax(logits, dim=1).item()
        
    print("="*60)
    print("📰 TIÊU ĐỀ GỐC:", title)
    print("🧹 TIÊU ĐỀ ĐÃ LỌC:", clean_title)
    print("-" * 60)
    
    # 🔧 ĐÃ SỬA LỖI IN KẾT QUẢ
    if predicted_class == 0:
        print(f"✅ KẾT LUẬN: TIN CHÍNH THỐNG / SỰ THẬT (Tỷ lệ chắc chắn: {prob_real:.2f}%)")
    else:
        print(f"🚨 KẾT LUẬN: TIN GIẢ / ẢNH CHẾ MEME (Tỷ lệ chắc chắn: {prob_fake:.2f}%)")
    print("="*60 + "\n")

# Khởi tạo công cụ
tokenizer = val_loader.dataset.tokenizer
transform = val_loader.dataset.transform

# ==========================================
# CHẠY THỬ NGHIỆM VỚI DỮ LIỆU ĐÃ ĐƯỢC CHỌN LỌC LẠI LINK
# ==========================================
print("🔍 ĐANG KIỂM THỬ THỰC TẾ...")
import time

print("🔍 ĐANG KIỂM THỬ THỰC TẾ (ĐÃ ĐỔI SERVER ẢNH VÀ THÊM THỜI GIAN NGHỈ)...")

# --- BÀI KIỂM TRA 1: TIN THỜI SỰ (Nên ra Real) ---
test_title_1 = "Global stock markets rally as new economic policies show positive results."
# Nguồn ảnh từ Unsplash (Máy chủ cực khỏe, không chặn request)
test_image_1 = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
predict_real_world_news(test_title_1, test_image_1, model, tokenizer, transform, device)

time.sleep(2) # Nghỉ 2 giây để tránh bị server chặn

# --- BÀI KIỂM TRA 2: TIN GIẢ / MEME (Nên ra Fake) ---
test_title_2 = "Scientists finally confirmed that ancient pyramids were built by aliens from Mars."
test_image_2 = "https://i.imgflip.com/4t0m5.jpg"
predict_real_world_news(test_title_2, test_image_2, model, tokenizer, transform, device)

time.sleep(2)

# --- BÀI KIỂM TRA 3: ẢNH CẮT GHÉP PHOTOSHOP (Nên ra Fake) ---
test_title_3 = "British Navy helicopter violently attacked by a massive great white shark during rescue mission!"
# Nguồn ảnh từ trang web chuyên lưu trữ các bức ảnh lừa đảo
test_image_3 = "https://hoaxes.org/images/hoaxarchive/helicopter_shark.jpg"
predict_real_world_news(test_title_3, test_image_3, model, tokenizer, transform, device)

# --------------------------------------------------------

