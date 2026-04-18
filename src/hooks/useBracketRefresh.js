import { useState, useRef, useEffect } from "react";
import { Animated } from "react-native";

export function useBracketRefresh(refetchMatchups, refetchTeams) {
  const [refreshing, setRefreshing] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (refreshing) {
      animationRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      animationRef.current.start();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      spinValue.setValue(0);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [refreshing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchMatchups(), refetchTeams()]);
    setRefreshing(false);
  };

  return { refreshing, spin, handleRefresh };
}
