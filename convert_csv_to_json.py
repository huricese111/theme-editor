import csv
import json

def convert_csv_to_json():
    csv_file_path = 'e:/Hepha theme editor/assets/20250915_dealers-data_LCH.csv'
    json_file_path = 'e:/Hepha theme editor/assets/dealers-data.json'
    
    dealers = []
    
    # Try different encodings to read CSV file
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    csv_data = None
    
    for encoding in encodings:
        try:
            with open(csv_file_path, 'r', encoding=encoding) as csv_file:
                csv_reader = csv.DictReader(csv_file)
                csv_data = list(csv_reader)
                print(f"Successfully read CSV with {encoding} encoding")
                print(f"Column names: {csv_reader.fieldnames}")
                print(f"Total rows: {len(csv_data)}")
                if csv_data:
                    print(f"First row keys: {list(csv_data[0].keys())}")
                break
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"Error with {encoding}: {e}")
            continue
    
    if csv_data is None:
        print("Error: Could not read CSV file with any supported encoding")
        return
    
    # Process the CSV data
    for i, row in enumerate(csv_data):
        try:
            # Map CSV fields to JSON structure with auto-generated ID
            dealer = {
                "id": f"location_{i+1:03d}",  # Auto-generate ID starting from location_001
                "store_name": row.get('Store Name', ''),
                "address": row.get('Address', ''),
                "city": row.get('City', ''),
                "province_state": "",  # No province info in CSV, set to empty string
                "country": row.get('Country', ''),
                "postal_code": row.get('Postal Code', ''),
                "phone": row.get('Phone', ''),
                "email": row.get('Email', ''),
                "website": row.get('Website', ''),
                "hours_of_operation": row.get('Hours of Operation', ''),
                "store_type": [row.get('Store Type', 'dealer')],  # Convert to array format
                "latitude": float(row.get('Latitude', 0)) if row.get('Latitude') else 0.0,
                "longitude": float(row.get('Longitude', 0)) if row.get('Longitude') else 0.0
            }
            dealers.append(dealer)
        except Exception as e:
            print(f"Error processing row {i+1}: {e}")
            print(f"Row data: {row}")
            continue
    
    # Create final JSON structure
    json_data = {
        "dealers": dealers
    }
    
    # Write to JSON file
    with open(json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(json_data, json_file, indent=2, ensure_ascii=False)
    
    print(f"Successfully converted {len(dealers)} records from CSV to JSON")
    print(f"Output file: {json_file_path}")

if __name__ == "__main__":
    convert_csv_to_json()