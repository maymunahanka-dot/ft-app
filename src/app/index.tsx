import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "../constants/theme";

const IndexScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"small"} color={Colors.primary} />
    </View>
  );
};

export default IndexScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
