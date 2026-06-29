import React, { useRef, useState, useEffect } from 'react';
import { View, Image, FlatList, useWindowDimensions, StyleSheet, Platform } from 'react-native';
import { Banner } from '../../types/banner';

interface HeroSliderProps {
  banners: Banner[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners }) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (Platform.OS === 'android' && url.includes('localhost')) {
        return url.replace('localhost', '10.0.2.2');
    }
    return url;
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= banners.length) nextIndex = 0;
        
        flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true
        });
        setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  if (banners.length === 0) return null;

  return (
    <View className="mb-4">
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
            const index = Math.floor(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
            <View style={{ width: width - 32, marginHorizontal: 16, height: 180, borderRadius: 16, overflow: 'hidden' }}>
                <Image 
                    source={{ uri: getImageUrl(item.imageUrl) || 'https://via.placeholder.com/600x300' }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            </View>
        )}
      />
      {/* Dots Indicator */}
      <View className="flex-row justify-center mt-3 gap-1.5">
        {banners.map((_, idx) => (
            <View 
                key={idx} 
                className={`h-1.5 rounded-full ${idx === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300 w-1.5'}`} 
            />
        ))}
      </View>
    </View>
  );
};
