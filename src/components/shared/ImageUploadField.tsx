import { useTheme } from "@/src/context/ThemeContext";
import { useUserImage } from "@/src/hooks/useUserImage";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { Image as ImageIcon, Upload } from "lucide-react-native";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  uri?: string;
  onChange: (uri: string) => void;
  label?: string;
};

export default function ImageUploadField({ uri, onChange, label = "Photo (Optional)" }: Props) {
  const { isDark } = useTheme();
  const { image, pickImage } = useUserImage({
    returnBase64: false,
    maxWidth: 1024,
    compress: 0.8,
  });

  useEffect(() => {
    if (image) onChange(image);
  }, [image]);

  const preview = image || (uri && (uri.startsWith("http") || uri.startsWith("file")) ? uri : "");
  const border = isDark ? "rgba(255,255,255,0.1)" : "#D1D5DC";
  const labelColor = isDark ? "rgba(160,160,160,1)" : "#4A5565";
  const hintColor = isDark ? "rgba(120,120,120,1)" : "#99A1AF";
  const circle = isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6";

  return (
    <View style={{ gap: spacing(8) }}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <Pressable style={[styles.picker, { borderColor: border }]} onPress={() => pickImage()}>
        {preview ? (
          <Image source={{ uri: preview }} style={styles.preview} />
        ) : (
          <>
            <View style={[styles.iconWrap, { backgroundColor: circle }]}>
              <Upload size={scale(24)} color={hintColor} />
            </View>
            <Text style={[styles.hint, { color: labelColor }]}>Tap to upload a photo</Text>
            <Text style={[styles.small, { color: hintColor }]}>PNG, JPG up to 10MB</Text>
          </>
        )}
      </Pressable>
      {preview ? (
        <Pressable onPress={() => onChange("")}>
          <Text style={styles.remove}>Remove photo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PhotoPlaceholder({ uri, height = 160 }: { uri?: string; height?: number }) {
  const { isDark } = useTheme();
  if (uri) {
    return <Image source={{ uri }} style={[styles.cardPhoto, { height }]} />;
  }
  return (
    <View
      style={[
        styles.cardPhoto,
        styles.placeholder,
        { height, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6" },
      ]}
    >
      <ImageIcon size={scale(28)} color={isDark ? "rgba(160,160,160,1)" : "#9CA3AF"} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
  },
  picker: {
    height: 150,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(6),
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
  },
  small: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
  },
  remove: {
    color: "#dc2626",
    fontFamily: "regular",
    fontSize: scaleFontSize(13),
  },
  cardPhoto: {
    width: "100%",
    borderRadius: 12,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});
