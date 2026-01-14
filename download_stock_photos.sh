#!/bin/bash
# Download Stock Photos for Suvenkari Website
# This script downloads free stock photos from Lorem Picsum (placeholder service)
# Replace these URLs with actual stock photos from Unsplash/Pexels/Pixabay

cd "$(dirname "$0")/assets/images" || exit 1

echo "Downloading stock photos for Suvenkari website..."

# Hero construction image (1200x800)
echo "1/5: Downloading hero construction image..."
curl -L "https://picsum.photos/1200/800?random=1" -o hero-construction.jpg
sleep 1

# Service: New build (800x600)
echo "2/5: Downloading new build service image..."
curl -L "https://picsum.photos/800/600?random=2" -o service-newbuild.jpg
sleep 1

# Service: Renovation (800x600)
echo "3/5: Downloading renovation service image..."
curl -L "https://picsum.photos/800/600?random=3" -o service-renovation.jpg
sleep 1

# Service: Interior (800x600)
echo "4/5: Downloading interior service image..."
curl -L "https://picsum.photos/800/600?random=4" -o service-interior.jpg
sleep 1

# Service: Business (800x600)
echo "5/5: Downloading business service image..."
curl -L "https://picsum.photos/800/600?random=5" -o service-business.jpg

echo ""
echo "✓ Stock photos downloaded successfully!"
echo ""
echo "IMPORTANT: These are placeholder images from Lorem Picsum."
echo "Please replace them with actual construction-themed photos from:"
echo "  - Unsplash: https://unsplash.com/s/photos/construction"
echo "  - Pexels: https://www.pexels.com/search/construction/"
echo "  - Pixabay: https://pixabay.com/images/search/construction/"
echo ""
echo "Recommended search terms:"
echo "  hero-construction.jpg: 'modern construction site crane'"
echo "  service-newbuild.jpg: 'new house construction'"
echo "  service-renovation.jpg: 'building renovation work'"
echo "  service-interior.jpg: 'interior renovation modern'"
echo "  service-business.jpg: 'commercial building construction'"
