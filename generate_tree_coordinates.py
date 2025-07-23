#!/usr/bin/env python3
import json
import random
import math
from datetime import datetime

def distance_between_points(lat1, lon1, lat2, lon2):
    """
    Calculate the distance between two points in meters using Haversine formula.
    """
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def point_to_line_distance(px, py, x1, y1, x2, y2):
    """
    Calculate the shortest distance from a point to a line segment.
    """
    # Convert to local coordinate system for easier calculation
    A = px - x1
    B = py - y1
    C = x2 - x1
    D = y2 - y1
    
    dot = A * C + B * D
    len_sq = C * C + D * D
    
    if len_sq == 0:
        # Line segment is a point
        return math.sqrt(A * A + B * B)
    
    param = dot / len_sq
    
    if param < 0:
        # Point is closest to start of segment
        xx = x1
        yy = y1
    elif param > 1:
        # Point is closest to end of segment
        xx = x2
        yy = y2
    else:
        # Point is closest to somewhere on the segment
        xx = x1 + param * C
        yy = y1 + param * D
    
    dx = px - xx
    dy = py - yy
    return math.sqrt(dx * dx + dy * dy)

def connection_avoids_trees(trail1, trail2, trees, min_distance=1.0):
    """
    Check if a connection between two trail points avoids all trees by at least min_distance.
    """
    # Convert coordinates to approximate local meters for easier calculation
    # This is a simplified approach for small areas
    lat_to_m = 111000
    lon_to_m = 111000 * math.cos(math.radians(trail1['latitude']))
    
    x1 = (trail1['longitude'] - (-39.574778643024274)) * lon_to_m
    y1 = (trail1['latitude'] - (-15.434481026415542)) * lat_to_m
    x2 = (trail2['longitude'] - (-39.574778643024274)) * lon_to_m
    y2 = (trail2['latitude'] - (-15.434481026415542)) * lat_to_m
    
    for tree in trees:
        tx = (tree['longitude'] - (-39.574778643024274)) * lon_to_m
        ty = (tree['latitude'] - (-15.434481026415542)) * lat_to_m
        
        distance_to_line = point_to_line_distance(tx, ty, x1, y1, x2, y2)
        if distance_to_line < min_distance:
            return False
    
    return True

def find_nearby_points(point, all_points, max_distance):
    """
    Find all points within max_distance meters of the given point.
    """
    nearby = []
    for other_point in all_points:
        if other_point['id'] != point['id']:
            dist = distance_between_points(
                point['latitude'], point['longitude'],
                other_point['latitude'], other_point['longitude']
            )
            if dist <= max_distance:
                nearby.append(other_point)
    return nearby

def generate_lot_network(center_lat, center_lon, lot_number):
    """
    Generate a spatial network with trees and trail points within a 1-hectare area for a single lot.
    Trees occupy space, trail points fill empty areas and connect to form paths.
    """
    print(f"Generating lot {lot_number} at coordinates: {center_lat}, {center_lon}")
    
    # Calculate offsets for 100m x 100m (1 hectare)
    lat_offset = 50 / 111000  # 50m offset from center
    lon_offset = 50 / (111000 * math.cos(math.radians(center_lat)))
    
    # Generate trees first
    trees = []
    tree_count = round(random.uniform(100, 800))  # Reasonable density that leaves space for trails
    
    for i in range(tree_count):
        # Generate random position within bounds
        random_lat_offset = random.uniform(-lat_offset, lat_offset)
        random_lon_offset = random.uniform(-lon_offset, lon_offset)
        
        tree_lat = center_lat + random_lat_offset
        tree_lon = center_lon + random_lon_offset
        
        tree = {
            "id": f"L{lot_number}_T{i + 1}",
            "type": "tree",
            "lot_id": lot_number,
            "latitude": round(tree_lat, 8),
            "longitude": round(tree_lon, 8),
            "maturityIndex": random.uniform(0, 1),
            "securityEvents": random.choice([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]),
            "fungalThreat": random.uniform(0, 1),
            "canopyGrading": random.uniform(0, 1),
            "treeAge": random.uniform(0, 20),
            "treeDensity": random.uniform(0, 1)
        }
        trees.append(tree)
    
    # Generate grid-based trail points
    trail_points = []
    grid_size = 25  # Create a 25x25 grid for potential trail points (4m spacing)
    trail_id_counter = 1
    rejected_trail_points = 0
    
    for i in range(grid_size):
        for j in range(grid_size):
            # Calculate grid position
            lat_step = (2 * lat_offset) / (grid_size - 1)
            lon_step = (2 * lon_offset) / (grid_size - 1)
            
            grid_lat = center_lat - lat_offset + i * lat_step
            grid_lon = center_lon - lon_offset + j * lon_step
            
            # Check if this position is at least 1 meter away from all trees
            min_distance_to_tree = float('inf')
            for tree in trees:
                dist = distance_between_points(grid_lat, grid_lon, tree['latitude'], tree['longitude'])
                min_distance_to_tree = min(min_distance_to_tree, dist)
            
            # Only create trail point if it's at least 1 meter from any tree
            if min_distance_to_tree >= 1.0:
                trail_point = {
                    "id": f"L{lot_number}_TP{trail_id_counter}",
                    "type": "trail",
                    "lot_id": lot_number,
                    "latitude": round(grid_lat, 8),
                    "longitude": round(grid_lon, 8),
                    "trailType": random.choice(["main", "secondary", "access"]),
                    "surface": random.choice(["dirt", "gravel", "natural"]),
                    "width": random.uniform(0.5, 2.0),  # Trail width in meters
                    "difficulty": random.choice(["easy", "moderate", "difficult"])
                }
                trail_points.append(trail_point)
                trail_id_counter += 1
    
    # Combine all points
    all_points = trees + trail_points
    
    # Generate connections between trail points
    connections = []
    connection_id = 1
    
    for trail_point in trail_points:
        # Find nearby trail points (within 15 meters for connection)
        nearby_trails = []
        for other_trail in trail_points:
            if other_trail['id'] != trail_point['id']:
                dist = distance_between_points(
                    trail_point['latitude'], trail_point['longitude'],
                    other_trail['latitude'], other_trail['longitude']
                )
                if dist <= 15.0:  # Connect trail points within 15 meters
                    nearby_trails.append((other_trail, dist))
        
        # Sort by distance and connect to closest 2-4 points
        nearby_trails.sort(key=lambda x: x[1])
        max_connections = random.randint(2, min(4, len(nearby_trails)))
        
        for i in range(min(max_connections, len(nearby_trails))):
            other_trail, distance = nearby_trails[i]
            
            # Check if connection already exists (avoid duplicates)
            connection_exists = any(
                (conn['from_id'] == trail_point['id'] and conn['to_id'] == other_trail['id']) or
                (conn['from_id'] == other_trail['id'] and conn['to_id'] == trail_point['id'])
                for conn in connections
            )
            
            # Only create connection if it doesn't exist and avoids trees by at least 1 meter
            if not connection_exists and connection_avoids_trees(trail_point, other_trail, trees, 1.0):
                connection = {
                    "id": f"L{lot_number}_C{connection_id}",
                    "lot_id": lot_number,
                    "from_id": trail_point['id'],
                    "to_id": other_trail['id'],
                    "distance": round(distance, 2),
                    "trail_type": "connector",
                    "bidirectional": True
                }
                connections.append(connection)
                connection_id += 1
    
    # Create the lot data structure
    lot_data = {
        "lot_id": lot_number,
        "metadata": {
            "total_points": len(all_points),
            "total_trees": len(trees),
            "total_trail_points": len(trail_points),
            "total_connections": len(connections),
            "area": "1 hectare (100m x 100m)",
            "center_coordinates": {
                "latitude": center_lat,
                "longitude": center_lon
            },
            "bounds": {
                "north": round(center_lat + lat_offset, 8),
                "south": round(center_lat - lat_offset, 8),
                "east": round(center_lon + lon_offset, 8),
                "west": round(center_lon - lon_offset, 8)
            },
            "generation_parameters": {
                "tree_exclusion_radius": "1.0 meters",
                "trail_connection_radius": "15.0 meters",
                "grid_resolution": f"{grid_size}x{grid_size}"
            }
        },
        "points": all_points,
        "trees": trees,
        "trail_points": trail_points,
        "connections": connections
    }
    
    return lot_data

def generate_non_overlapping_lot_center(existing_centers, initial_lat, initial_lon, min_separation=150):
    """
    Generate a new lot center that doesn't overlap with existing lots.
    Uses a spiral pattern to find valid positions with minimum separation.
    """
    lat_offset = (min_separation / 111000)  # Convert meters to latitude degrees
    lon_offset = (min_separation / (111000 * math.cos(math.radians(initial_lat))))  # Convert meters to longitude degrees
    
    max_attempts = 500
    spiral_radius = 1
    
    for attempt in range(max_attempts):
        # Generate candidate positions in expanding spiral pattern
        if attempt == 0:
            # First position is the initial position
            candidate_lat = initial_lat
            candidate_lon = initial_lon
        else:
            # Generate positions in a spiral pattern
            angle = (attempt - 1) * 0.5  # Angle increment for spiral
            radius = spiral_radius * math.sqrt(attempt - 1)  # Expanding radius
            
            candidate_lat = initial_lat + radius * lat_offset * math.cos(angle)
            candidate_lon = initial_lon + radius * lon_offset * math.sin(angle)
        
        # Check if this position is far enough from all existing centers
        valid_position = True
        for existing_center in existing_centers:
            distance = distance_between_points(
                candidate_lat, candidate_lon,
                existing_center['latitude'], existing_center['longitude']
            )
            if distance < min_separation:
                valid_position = False
                break
        
        if valid_position:
            return candidate_lat, candidate_lon
        
        # Increase spiral radius occasionally for better coverage
        if attempt % 50 == 0:
            spiral_radius += 0.5
    
    # Fallback: use a more distant random position if spiral fails
    print(f"Warning: Could not find non-overlapping position after {max_attempts} attempts. Using fallback.")
    fallback_distance = min_separation * 2
    angle = random.uniform(0, 2 * math.pi)
    fallback_lat = initial_lat + (fallback_distance / 111000) * math.cos(angle)
    fallback_lon = initial_lon + (fallback_distance / (111000 * math.cos(math.radians(initial_lat)))) * math.sin(angle)
    
    return fallback_lat, fallback_lon

def validate_lot_spacing(lot_centers, min_separation=150):
    """
    Validate that all lots maintain minimum separation distance.
    """
    violations = []
    for i, center1 in enumerate(lot_centers):
        for j, center2 in enumerate(lot_centers[i+1:], i+1):
            distance = distance_between_points(
                center1['latitude'], center1['longitude'],
                center2['latitude'], center2['longitude']
            )
            if distance < min_separation:
                violations.append({
                    'lot1': i + 1,
                    'lot2': j + 1,
                    'distance': distance,
                    'required': min_separation
                })
    return violations

def main():
    lot_total = round(random.uniform(2, 20))
    min_separation = 98.0  # Minimum distance between lot centers in meters (2m overlap between lots)
    print(f"Generating {lot_total} separate cocoa plantation lots...")
    print(f"Minimum lot separation: {min_separation}m")
    print("=" * 50)
    
    all_lots = []
    lot_centers = []
    total_trees = 0
    total_trail_points = 0
    total_connections = 0
    
    # Starting point (Camacan, Bahia, Brazil)
    initial_lat = -15.434481026415542
    initial_lon = -39.574778643024274
    
    for lot_num in range(1, lot_total + 1):
        # Generate non-overlapping lot center
        center_lat, center_lon = generate_non_overlapping_lot_center(
            lot_centers, initial_lat, initial_lon, min_separation
        )
        
        lot_centers.append({
            'latitude': center_lat,
            'longitude': center_lon
        })
        
        # Generate the lot
        lot_data = generate_lot_network(center_lat, center_lon, lot_num)
        all_lots.append(lot_data)
        
        # Update totals
        total_trees += lot_data['metadata']['total_trees']
        total_trail_points += lot_data['metadata']['total_trail_points']
        total_connections += lot_data['metadata']['total_connections']
        
        print(f"  Lot {lot_num}: {lot_data['metadata']['total_trees']} trees, "
              f"{lot_data['metadata']['total_trail_points']} trail points, "
              f"{lot_data['metadata']['total_connections']} connections")
    
    # Validate lot spacing
    spacing_violations = validate_lot_spacing(lot_centers, min_separation)
    if spacing_violations:
        print(f"\nWarning: Found {len(spacing_violations)} lot spacing violations:")
        for violation in spacing_violations:
            print(f"  Lots {violation['lot1']} and {violation['lot2']}: {violation['distance']:.1f}m (required: {violation['required']:.1f}m)")
    else:
        print(f"\n✓ All lots maintain minimum {min_separation}m separation")
    
    # Create combined data structure
    combined_data = {
        "metadata": {
            "total_lots": len(all_lots),
            "total_trees": total_trees,
            "total_trail_points": total_trail_points,
            "total_connections": total_connections,
            "total_points": total_trees + total_trail_points,
            "area_per_lot": "1 hectare (100m x 100m)",
            "total_area": f"{len(all_lots)} hectares",
            "generation_parameters": {
                "lots_count": len(all_lots),
                "min_lot_distance": f"{min_separation} meters",
                "tree_exclusion_radius": "1.0 meters",
                "trail_connection_radius": "15.0 meters"
            },
            "generated_at": datetime.now().isoformat() + "Z"
        },
        "lots": all_lots,
        # Flatten data for backward compatibility
        "points": [],
        "trees": [],
        "trail_points": [],
        "connections": []
    }
    
    # Flatten all data for backward compatibility
    for lot in all_lots:
        combined_data["points"].extend(lot["points"])
        combined_data["trees"].extend(lot["trees"])
        combined_data["trail_points"].extend(lot["trail_points"])
        combined_data["connections"].extend(lot["connections"])
    
    # Save to JSON file
    with open('tree_coordinates_with_trails.json', 'w') as f:
        json.dump(combined_data, f, indent=2)
    
    print("\n" + "=" * 50)
    print(f"Generated {len(all_lots)} lots with:")
    print(f"  - {total_trees} total trees")
    print(f"  - {total_trail_points} total trail points")
    print(f"  - {total_connections} total connections")
    print(f"  - {total_trees + total_trail_points} total points")
    print(f"Saved to: tree_coordinates_with_trails.json")
    print(f"Total area covered: {len(all_lots)} hectares")
    print("\nLot centers:")
    for i, center in enumerate(lot_centers, 1):
        print(f"  Lot {i}: {center['latitude']:.8f}, {center['longitude']:.8f}")

if __name__ == "__main__":
    main()
