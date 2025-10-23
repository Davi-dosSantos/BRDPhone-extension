import { extendTheme } from "@chakra-ui/react";

const mainTheme = extendTheme({
  fonts: {
    heading: `'Source Sans 3', Arial, sans-serif`,
    body: `'Source Sans 3', Arial, sans-serif`,
  },
  colors: {
    jambonz: {
      0: "#B8C9E0", // Muito claro (quase branco/cinza claro)
      50: "#98AECF", // Claro
      100: "#7993BF",
      200: "#5B79AF",
      300: "#3D5F9A",
      400: "#2B4C80", // Tom que precede a cor principal
      450: "#1E4473",
      500: "#183E65", // Cor Principal
      550: "#14375A",
      600: "#10304F", // Tom mais escuro
      700: "#0C2744",
      800: "#081E33",
      900: "#041521", // Mais escuro (quase preto)
    },
    grey: {
      50: "#FFFFFF",
      75: "#F9F9F9",
      100: "#F5F5F5",
      200: "#ECECEC",
      300: "#E3E3E3",
      400: "#D9D9D9",
      500: "#EBEBEB",
      600: "#BFBFBF",
      700: "#969696",
      800: "#6D6D6D",
      900: "#434343",
    },
    greenish: {
      500: "#158477",
    },
    blue: {
      600: "#4492FF", //for toggle icon
    },
  },
  components: {
    FormLabel: {
      baseStyle: {
        _parent: { name: "form" },
        fontSize: "14px",
        fontWeight: "normal",
      },
    },
    Input: {
      baseStyle: {
        field: {
          _parent: { name: "form" },
          fontSize: "14px",
          fontWeight: "bold",
        },
      },
    },
  },
});

export const colors = {
  //to use outside of chakra component
  jambonz: "#183E65",
};

export default mainTheme;
