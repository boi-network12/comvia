import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

interface SplashScreenProps {
    onAnimationComplete: () => void
}

export default function SplashScreen({ onAnimationComplete}: SplashScreenProps) {
    const [displayText, setDisplayText] = useState("");
    const fullText = 'comvia';

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < fullText.length) {
                setDisplayText((prev) => prev + fullText[index]);
                index++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    onAnimationComplete()
                }, 500)
            }
        }, 150);

        return () => clearInterval(interval);
    },[onAnimationComplete]);

  return (
    <SafeAreaView>
      <View>
        <Text>{displayText}</Text>
      </View>
    </SafeAreaView>
  )
}