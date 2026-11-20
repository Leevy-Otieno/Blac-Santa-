import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export interface AnimatedIconProps {
  name?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  pulse?: boolean;
  bounceOnPress?: boolean;
  onPress?: () => void;
  className?: string;
}

export function AnimatedIcon({
  name = "gift",
  size = 22,
  color = "#E11D48",
  pulse = false,
  bounceOnPress = true,
  onPress,
  className = "",
}: AnimatedIconProps) {
  const scale = useSharedValue(1);
  const rotateDeg = useSharedValue(0);

  useEffect(() => {
    if (!pulse) {
      scale.value = withTiming(1, { duration: 180 });
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [pulse, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotateDeg.value}deg` }],
  }));

  const triggerBounce = () => {
    if (!bounceOnPress) return;
    scale.value = withSequence(
      withSpring(1.24, { damping: 8, stiffness: 260 }),
      withSpring(1, { damping: 12, stiffness: 220 }),
    );
    rotateDeg.value = withSequence(
      withTiming(-10, { duration: 80 }),
      withTiming(10, { duration: 90 }),
      withTiming(0, { duration: 80 }),
    );
  };

  const handlePress = () => {
    triggerBounce();
    onPress?.();
  };

  const iconBody = (
    <Animated.View
      style={animatedStyle}
      className={`items-center justify-center ${className}`}
    >
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );

  if (onPress || bounceOnPress) {
    return (
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        className="items-center justify-center"
      >
        {iconBody}
      </Pressable>
    );
  }

  return <View className="items-center justify-center">{iconBody}</View>;
}

export default AnimatedIcon;
