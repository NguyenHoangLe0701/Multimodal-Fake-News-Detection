import torch
import torch.nn as nn
from transformers import BertModel
from torchvision import models as torchvision_models

class DualStreamFakeNewsModel(nn.Module):
    def __init__(self):
        super(DualStreamFakeNewsModel, self).__init__()
        self.bert = BertModel.from_pretrained('bert-base-uncased')  # nosec B615
        self.text_dropout = nn.Dropout(p=0.5)
        
        resnet = torchvision_models.resnet50(weights=None)
        self.resnet_features = nn.Sequential(*list(resnet.children())[:-1])
        self.image_dropout = nn.Dropout(p=0.5)
        
        self.fc1 = nn.Linear(768 + 2048, 512)
        self.relu = nn.ReLU()
        self.fusion_dropout = nn.Dropout(p=0.5)
        self.fc2 = nn.Linear(512, 2)

    def forward(self, input_ids, attention_mask, image):
        bert_outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        text_features = self.text_dropout(bert_outputs.pooler_output)
        image_features = self.resnet_features(image)
        image_features = self.image_dropout(image_features.view(image_features.size(0), -1))
        combined_features = torch.cat((text_features, image_features), dim=1)
        x = self.fusion_dropout(self.relu(self.fc1(combined_features)))
        logits = self.fc2(x)
        return logits


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