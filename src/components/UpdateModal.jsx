import { Modal, View, Text, TouchableOpacity } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";

export default function UpdateModal({
  visible,
  required,
  message,
  onUpdate,
  onLater,
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={required ? undefined : onLater}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#1f2937",
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 400,
            borderWidth: 1,
            borderColor: "#374151",
          }}
        >
          {/* Icon */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {required ? (
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <AlertCircle size={36} color="#ef4444" />
              </View>
            ) : (
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "rgba(249, 115, 22, 0.1)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <RefreshCw size={36} color="#f97316" />
              </View>
            )}

            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
              }}
            >
              {required ? "Update Required" : "Update Available"}
            </Text>
          </View>

          {/* Message */}
          <Text
            style={{
              fontSize: 15,
              color: "#d1d5db",
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 24,
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={onUpdate}
              style={{
                backgroundColor: required ? "#ef4444" : "#f97316",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "white",
                }}
              >
                Update Now
              </Text>
            </TouchableOpacity>

            {!required && (
              <TouchableOpacity
                onPress={onLater}
                style={{
                  backgroundColor: "transparent",
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#374151",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#9ca3af",
                  }}
                >
                  Maybe Later
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {required && (
            <Text
              style={{
                fontSize: 12,
                color: "#6b7280",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              This update is required to continue using BracketOne
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}
