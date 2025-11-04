import csv
import json
import sys
import os

def convert_csv_to_json(csv_file_path):
    # Output JSON file will be in the 'assets' folder relative to the script.
    script_dir = os.path.dirname(os.path.realpath(__file__))
    json_file_path = os.path.join(script_dir, 'assets', 'dealers-data.json')
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(json_file_path), exist_ok=True)

    dealers = []
    
    # Try different encodings to read CSV file
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    csv_data = None
    
    print(f"Reading CSV file: {csv_file_path}")

    for encoding in encodings:
        try:
            with open(csv_file_path, 'r', encoding=encoding, newline='') as csv_file:
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
        except FileNotFoundError:
            print(f"Error: Input file not found at {csv_file_path}")
            return
        except Exception as e:
            print(f"Error with {encoding}: {e}")
            continue
    
    if csv_data is None:
        print("Error: Could not read CSV file with any of the attempted encodings.")
        return
    
    def safe_float(s):
        if not s:
            return 0.0
        try:
            return float(s.replace(',', '.'))
        except (ValueError, TypeError):
            return 0.0
    
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
                "latitude": safe_float(row.get('Latitude')),
                "longitude": safe_float(row.get('Longitude'))
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
    
    print(f"\nSuccessfully converted {len(dealers)} records from CSV to JSON.")
    print(f"Output file: {json_file_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        csv_file_path = sys.argv[1]
        convert_csv_to_json(csv_file_path)
    else:
        print("This script converts a CSV file to a JSON file.")
        print("Usage: Drag and drop a CSV file onto this script to convert it.")
    
    # Keep the console window open to see the output
    input("\nPress Enter to exit.")