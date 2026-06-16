import os
import pandas as pd
from PIL import Image, ImageDraw

def create_mock_dataset():
    """
    Generates a tiny mock dataset (CSV + images) so you can test 
    the training pipeline without downloading gigabytes of real data.
    """
    print("Generating mock dataset...")
    
    # ── 1. Setup Directories ──
    img_dir = 'datasets/raw/images'
    processed_dir = 'datasets/processed'
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(processed_dir, exist_ok=True)
    
    # ── 2. Create Dummy Data ──
    # Label: 0 = Real, 1 = Fake
    data = [
        {"text": "Scientists successfully land rover on the new asteroid.", "label": 0, "color": "blue"},
        {"text": "Aliens have officially landed in New York, government hiding it!", "label": 1, "color": "red"},
        {"text": "The economy saw a 3% growth in the third quarter of this year.", "label": 0, "color": "green"},
        {"text": "Secret formula found to turn water into gold instantly.", "label": 1, "color": "yellow"},
        {"text": "Local team wins the championship after a stunning 90-minute goal.", "label": 0, "color": "purple"},
        {"text": "Drinking 5 liters of saltwater cures all known diseases.", "label": 1, "color": "orange"},
    ]
    
    # ── 3. Generate Images and CSV rows ──
    train_rows = []
    val_rows = []
    
    for i, item in enumerate(data):
        filename = f"mock_img_{i}.jpg"
        filepath = os.path.join(img_dir, filename)
        
        # Create a simple colored square image with text
        img = Image.new('RGB', (224, 224), color=item['color'])
        d = ImageDraw.Draw(img)
        d.text((10,10), f"Sample {i}", fill=(255,255,255))
        img.save(filepath)
        
        row = {
            "text": item["text"],
            "image_filename": filename,
            "label": item["label"]
        }
        
        # Split: First 4 to Train, Last 2 to Val
        if i < 4:
            train_rows.append(row)
        else:
            val_rows.append(row)
            
    # ── 4. Save CSVs ──
    train_df = pd.DataFrame(train_rows)
    train_df.to_csv(os.path.join(processed_dir, 'train.csv'), index=False)
    
    val_df = pd.DataFrame(val_rows)
    val_df.to_csv(os.path.join(processed_dir, 'val.csv'), index=False)
    
    print(f"Created {len(train_rows)} training samples and {len(val_rows)} validation samples.")
    print("Run 'python train.py' to test the pipeline!")

if __name__ == "__main__":
    create_mock_dataset()
