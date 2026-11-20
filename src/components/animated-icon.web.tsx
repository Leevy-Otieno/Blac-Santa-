import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import styles from "./animated-icon.module.css";

export interface AnimatedIconWebProps {
  name?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  pulse?: boolean;
  onPress?: () => void;
  className?: string;
}

export function AnimatedIconWeb({
  name = "gift",
  size = 22,
  color = "#E11D48",
  pulse = false,
  onPress,
  className = "",
}: AnimatedIconWebProps) {
  const [popped, setPopped] = useState(false);

  const handlePress = () => {
    setPopped(true);
    setTimeout(() => setPopped(false), 240);
    onPress?.();
  };

  const cssClasses = [
    styles.giftIconWrapper,
    onPress ? styles.giftIconInteractive : "",
    pulse ? styles.giftIconPulse : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Pressable
      onPress={handlePress}
      className={`items-center justify-center ${className}`}
    >
      <View
        // @ts-expect-error CSS module class name on web
        className={cssClasses}
        style={popped ? { transform: [{ scale: 1.18 }] } : undefined}
      >
        <Ionicons name={name} size={size} color={color} />
      </View>
    </Pressable>
  );
}

export default AnimatedIconWeb;
