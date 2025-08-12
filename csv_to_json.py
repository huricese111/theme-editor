import csv
import json
import os

def convert_csv_to_dealers_json():
    # File paths
    csv_file_path = 'e:/Hepha theme editor/assets/export.csv'
    json_file_path = 'e:/Hepha theme editor/assets/dealers-data.json'
    
    try:
        # Read CSV file
        dealers_list = []
        
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for index, row in enumerate(reader, 1):
                try:
                    # Generate store_type array based on Y/N fields
                    store_types = []
                    if row.get('Dealer (Y/N)', '').upper() == 'Y':
                        store_types.append('dealer')
                    if row.get('Rental Station (Y/N)', '').upper() == 'Y':
                        store_types.append('rental')
                    if row.get('Service Center (Y/N)', '').upper() == 'Y':
                        store_types.append('service')
                    
                    # If no specific type is marked, default to dealer
                    if not store_types:
                        store_types = ['dealer']
                    
                    # Convert latitude and longitude to float
                    try:
                        latitude = float(row.get('Latitude', 0)) if row.get('Latitude', '').strip() else 0.0
                    except (ValueError, TypeError):
                        latitude = 0.0
                    
                    try:
                        longitude = float(row.get('Longitude', 0)) if row.get('Longitude', '').strip() else 0.0
                    except (ValueError, TypeError):
                        longitude = 0.0
                    
                    # Helper function to clean and convert empty strings to empty string (not null)
                    def clean_field(value):
                        if value is None or str(value).strip() == '':
                            return ""
                        return str(value).strip()
                    
                    # Create dealer record
                    dealer = {
                        "id": f"location_{index:03d}",
                        "store_name": clean_field(row.get('Name', '')),
                        "address": clean_field(row.get('Address', '')),
                        "city": clean_field(row.get('City', '')),
                        "province_state": clean_field(row.get('Province/State', '')),
                        "country": clean_field(row.get('Country', '')),
                        "postal_code": clean_field(row.get('Postal/Zip Code', '')),
                        "phone": clean_field(row.get('Phone', '')),
                        "email": clean_field(row.get('Email', '')),
                        "website": clean_field(row.get('Website', '')),
                        "hours_of_operation": clean_field(row.get('Hours', '')),
                        "store_type": store_types,
                        "latitude": latitude,
                        "longitude": longitude
                    }
                    
                    dealers_list.append(dealer)
                    
                except Exception as e:
                    print(f"Error processing row {index}: {e}")
                    continue
        
        # Create the final JSON structure
        dealers_data = {
            "dealers": dealers_list
        }
        
        # Write to JSON file
        with open(json_file_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(dealers_data, jsonfile, indent=2, ensure_ascii=False)
        
        # Get file sizes
        csv_size = os.path.getsize(csv_file_path)
        json_size = os.path.getsize(json_file_path)
        
        # Print statistics
        print(f"\n=== Conversion Complete ===")
        print(f"Total records processed: {len(dealers_list)}")
        print(f"CSV file size: {csv_size:,} bytes")
        print(f"JSON file size: {json_size:,} bytes")
        
        # Count store types
        dealer_count = sum(1 for dealer in dealers_list if 'dealer' in dealer['store_type'])
        rental_count = sum(1 for dealer in dealers_list if 'rental' in dealer['store_type'])
        service_count = sum(1 for dealer in dealers_list if 'service' in dealer['store_type'])
        
        print(f"\n=== Store Type Statistics ===")
        print(f"Dealers: {dealer_count}")
        print(f"Rental Stations: {rental_count}")
        print(f"Service Centers: {service_count}")
        
        # Show first 3 records as preview
        print(f"\n=== Preview (First 3 Records) ===")
        for i, dealer in enumerate(dealers_list[:3]):
            print(f"\nRecord {i+1}:")
            print(f"  ID: {dealer['id']}")
            print(f"  Store Name: {dealer['store_name']}")
            print(f"  Address: {dealer['address']}")
            print(f"  City: {dealer['city']}")
            print(f"  Store Type: {dealer['store_type']}")
            print(f"  Coordinates: ({dealer['latitude']}, {dealer['longitude']})")
        
        print(f"\nJSON file saved as: {json_file_path}")
        
    except FileNotFoundError:
        print(f"Error: Could not find the CSV file at {csv_file_path}")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    convert_csv_to_dealers_json()