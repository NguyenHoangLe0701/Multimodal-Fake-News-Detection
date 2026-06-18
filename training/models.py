import torch
import torch.nn as nn
from torchvision import models
from transformers import AutoModel

class MultimodalFakeNewsModel(nn.Module):
    def __init__(self, text_model_name='vinai/phobert-base', num_classes=2):
        """
        Late Fusion Architecture:
        - Text Branch: Pre-trained Transformer (e.g., BERT, RoBERTa)
        - Image Branch: Pre-trained CNN (e.g., ResNet50)
        """
        super(MultimodalFakeNewsModel, self).__init__()
        
        # ── Text Branch (Transformer) ──
        # We load a pre-trained transformer model. 
        self.text_encoder = AutoModel.from_pretrained(text_model_name)
        # Most base transformers have a hidden size of 768
        self.text_dim = self.text_encoder.config.hidden_size
        
        # ── Image Branch (ResNet) ──
        # We use a pre-trained ResNet50 and remove the final classification layer.
        resnet = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        # Extract all layers except the last fully connected (fc) layer
        modules = list(resnet.children())[:-1]
        self.image_encoder = nn.Sequential(*modules)
        # ResNet50 outputs a 2048-dimensional vector before the FC layer
        self.image_dim = 2048
        
        # ── Fusion & Classification Layer ──
        # We concatenate the text and image vectors
        combined_dim = self.text_dim + self.image_dim
        
        self.classifier = nn.Sequential(
            nn.Linear(combined_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, input_ids, attention_mask, images):
        """
        Forward pass for the multimodal inputs.
        
        Args:
            input_ids: Tokenized text tensor
            attention_mask: Attention mask for text tensor
            images: Normalized image tensor (B, C, H, W)
        """
        # 1. Process Text
        # The transformer returns a tuple; index [1] is the pooled output (CLS token representation)
        text_outputs = self.text_encoder(input_ids=input_ids, attention_mask=attention_mask)
        text_features = text_outputs[1]  # Shape: (Batch, 768)
        
        # 2. Process Image
        # ResNet outputs (Batch, 2048, 1, 1). We use view() to flatten it to (Batch, 2048)
        image_outputs = self.image_encoder(images)
        image_features = image_outputs.view(image_outputs.size(0), -1)  # Shape: (Batch, 2048)
        
        # 3. Fusion
        # Concatenate along the feature dimension (dim=1)
        fused_features = torch.cat((text_features, image_features), dim=1)  # Shape: (Batch, 2816)
        
        # 4. Classify
        logits = self.classifier(fused_features)
        return logits

# Note: In PyTorch, if using CrossEntropyLoss, the model should output raw logits,
# NOT probabilities (no softmax at the end). The loss function applies LogSoftmax internally.
