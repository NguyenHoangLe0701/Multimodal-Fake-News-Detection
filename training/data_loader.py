import os
import pandas as pd
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms

class MultimodalDataset(Dataset):
    def __init__(self, csv_file, img_dir, tokenizer, max_length=128):
        """
        Custom Dataset for Multimodal Fake News.
        
        Args:
            csv_file (string): Path to the csv file with annotations.
                               Expected columns: 'text', 'image_filename', 'label' (0 or 1).
            img_dir (string): Directory with all the images.
            tokenizer: HuggingFace tokenizer instance.
            max_length (int): Maximum sequence length for the text tokenizer.
        """
        self.data_frame = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.tokenizer = tokenizer
        self.max_length = max_length
        
        # Standard ImageNet normalization for ResNet
        self.image_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                 std=[0.229, 0.224, 0.225])
        ])

    def __len__(self):
        return len(self.data_frame)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        # 1. Get Text & Tokenize
        text = str(self.data_frame.iloc[idx]['text'])
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt',
        )

        # 2. Get Image & Transform
        img_name = os.path.join(self.img_dir, str(self.data_frame.iloc[idx]['image_filename']))
        try:
            # Convert to RGB to ensure 3 channels (handles grayscale or RGBA images)
            image = Image.open(img_name).convert('RGB')
            image = self.image_transform(image)
        except Exception as e:
            # If image is missing or corrupted, generate a blank placeholder image (black)
            # This allows the model to continue training mostly relying on the text for this sample
            # print(f"Warning: Could not load image {img_name}. Using blank image. Error: {e}")
            image = torch.zeros(3, 224, 224)

        # 3. Get Label
        label = int(self.data_frame.iloc[idx]['label'])

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'images': image,
            'labels': torch.tensor(label, dtype=torch.long)
        }
