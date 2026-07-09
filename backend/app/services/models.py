import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import BertModel
from torchvision import models as torchvision_models

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
        self.bert = BertModel.from_pretrained('bert-base-uncased')  # nosec B615
        self.text_dropout = nn.Dropout(p=0.5)
        self.text_projection = nn.Linear(768, 512)      # Ép text về 512D

        # 2. NHÁNH IMAGE (ResNet50)
        resnet = torchvision_models.resnet50(weights=None)
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
        image_features = self.image_dropout(
            image_features.view(image_features.size(0), -1)
        )
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


class TextOnlyFakeNewsModel(nn.Module):
    """BERT Classifier — Chi xu ly van ban (text-only)"""
    def __init__(self):
        super(TextOnlyFakeNewsModel, self).__init__()
        self.bert = BertModel.from_pretrained('bert-base-uncased')  # nosec B615
        self.dropout = nn.Dropout(p=0.3)
        self.fc = nn.Linear(768, 2)  # 2 class: REAL / FAKE

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled = self.dropout(outputs.pooler_output)
        return self.fc(pooled)

class VideoDeepfakeModel(nn.Module):
    """3D ResNet Model cho viec phan tich Frame Video"""
    def __init__(self, num_classes=2):
        super(VideoDeepfakeModel, self).__init__()
        from torchvision.models.video import r3d_18
        self.video_resnet = r3d_18(weights=None)
        
        num_ftrs = self.video_resnet.fc.in_features
        self.video_resnet.fc = nn.Sequential(
            nn.BatchNorm1d(num_ftrs),
            nn.Dropout(0.5),
            nn.Linear(num_ftrs, num_classes)
        )

    def forward(self, x):
        return self.video_resnet(x)