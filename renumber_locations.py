import json
import re

def renumber_location_ids(json_file_path):
    """
    Renumber location IDs in JSON file to make them consecutive
    """
    # Read JSON file
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # Check data structure
    if 'dealers' not in data:
        print("Error: 'dealers' field not found in JSON file")
        return
    
    dealers = data['dealers']
    print(f"Found {len(dealers)} dealer records")
    
    # Renumber IDs
    for index, dealer in enumerate(dealers, start=1):
        # Generate new ID in format location_001, location_002, etc.
        new_id = f"location_{index:03d}"
        old_id = dealer.get('id', 'unknown')
        dealer['id'] = new_id
        print(f"Updated: {old_id} -> {new_id}")
    
    # Create backup filename
    backup_file = json_file_path.replace('.json', '_backup.json')
    
    # Backup original file
    with open(backup_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
    print(f"\nOriginal file backed up as: {backup_file}")
    
    # Save updated file
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
    
    print(f"\nRenumbering completed!")
    print(f"Total records processed: {len(dealers)}")
    print(f"ID range: location_001 to location_{len(dealers):03d}")

if __name__ == "__main__":
    # File path
    json_file_path = r"e:\Hepha theme editor\assets\dealers-data.json"
    
    try:
        renumber_location_ids(json_file_path)
        print("\nOperation completed successfully!")
    except FileNotFoundError:
        print(f"Error: File not found {json_file_path}")
    except json.JSONDecodeError:
        print("Error: Invalid JSON file format")
    except Exception as e:
        print(f"Error occurred: {e}")