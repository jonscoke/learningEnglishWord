import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e6f8f4",
      100: "#c2ece2",
      200: "#9cdfd0",
      300: "#75d2bd",
      400: "#4ec5aa",
      500: "#1f9d86",
      600: "#17735f",
      700: "#115647",
      800: "#0a382f",
      900: "#041a17"
    }
  },
  fonts: {
    heading: '"Fraunces", serif',
    body: '"Nunito", sans-serif'
  },
  styles: {
    global: {
      body: {
        color: "gray.800"
      }
    }
  },
  radii: {
    card: "24px"
  }
});

export default theme;
