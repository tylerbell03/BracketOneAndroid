import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertCircle } from "lucide-react-native";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, errorInfo, reset }) {
  const insets = useSafeAreaInsets();
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0b121c",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          flex: 1,
          padding: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AlertCircle size={64} color="#ef4444" style={{ marginBottom: 16 }} />

        <Text
          style={{
            color: "#ef4444",
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          App Crashed
        </Text>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 14,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Something went wrong.{" "}
          {isDevelopment ? "Here's what happened:" : "Please try again."}
        </Text>

        {isDevelopment && (
          <ScrollView
            style={{
              maxHeight: 300,
              width: "100%",
              backgroundColor: "#1f2937",
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#ef4444",
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Error:
            </Text>
            <Text style={{ color: "#f9fafb", fontSize: 12, marginBottom: 12 }}>
              {error?.toString() || "Unknown error"}
            </Text>

            {error?.stack && (
              <>
                <Text
                  style={{
                    color: "#ef4444",
                    fontSize: 12,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  Stack Trace:
                </Text>
                <Text
                  style={{
                    color: "#f9fafb",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                >
                  {error.stack}
                </Text>
              </>
            )}

            {errorInfo?.componentStack && (
              <>
                <Text
                  style={{
                    color: "#ef4444",
                    fontSize: 12,
                    fontWeight: "600",
                    marginTop: 12,
                    marginBottom: 4,
                  }}
                >
                  Component Stack:
                </Text>
                <Text
                  style={{
                    color: "#f9fafb",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                >
                  {errorInfo.componentStack}
                </Text>
              </>
            )}
          </ScrollView>
        )}

        <TouchableOpacity
          onPress={reset}
          style={{
            backgroundColor: "#f97316",
            paddingHorizontal: 32,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ErrorBoundary;
