import csv
import json
import sys
import os

def convert_csv_to_json(csv_file_path):
    script_dir = os.path.dirname(os.path.realpath(__file__))
    json_file_path = os.path.join(script_dir, 'assets', 'dealers-data.json')
    os.makedirs(os.path.dirname(json_file_path), exist_ok=True)

    dealers = []
    
    print(f"Reading CSV file: {csv_file_path}")

    try:
        with open(csv_file_path, 'r', encoding='utf-8-sig', newline='') as csv_file:
            reader = csv.reader(csv_file)
            header = next(reader)
            header[0] = header[0].lstrip('\ufeff')
            csv_data = [row for row in reader]
            print(f"Successfully read {len(csv_data)} rows from CSV.")

    except FileNotFoundError:
        print(f"Error: Input file not found at {csv_file_path}")
        return
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return

    def safe_float(s):
        if not s:
            return 0.0
        try:
            return float(s.replace(',', '.'))
        except (ValueError, TypeError):
            return 0.0

    for i, row in enumerate(csv_data):
        if len(row) != len(header):
            print(f"Warning: Skipping malformed row {i+1} with {len(row)} columns instead of {len(header)}. Data: {row}")
            continue
        row_data = {header[j]: value for j, value in enumerate(row)}
        try:
            dealer = {
                "id": f"location_{i+1:03d}",
                "store_name": row_data.get('Store Name', ''),
                "address": row_data.get('Address', ''),
                "city": row_data.get('City', ''),
                "province_state": "",
                "country": row_data.get('Country', ''),
                "postal_code": row_data.get('Postal Code', ''),
                "phone": row_data.get('Phone', ''),
                "email": row_data.get('Email', ''),
                "website": row_data.get('Website', ''),
                "hours_of_operation": row_data.get('Hours of Operation', ''),
                "store_type": [row_data.get('Store Type', 'dealer')],
                "latitude": safe_float(row_data.get('Latitude')),
                "longitude": safe_float(row_data.get('Longitude'))
            }
            dealers.append(dealer)
        except Exception as e:
            print(f"Error processing row {i+1}: {e}")
            print(f"Row data: {row}")
            continue

    json_data = {"dealers": dealers}

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
    input("\nPress Enter to exit.")