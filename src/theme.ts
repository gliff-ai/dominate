import { ThemeProvider, createTheme, Theme } from "@material-ui/core/styles";
import { imgSrc } from "@/helpers";

const squiggles = imgSrc("squig-black", "png");

const white = "#FFF";
const backgroundWhite = "#F2F2F2";
const lightGrey = "#FAFAFA";
const middleGrey = "#A1A1A1";
const darkGrey = "#2B2F3A";
const black = "#000";
const mainGreen = "#02FFAD";
const purple = "#AE79FF";
const blue = "#00DBFF";

const theme: Theme = createTheme({
  palette: {
    primary: {
      main: mainGreen,
      light: white,
    },
    secondary: {
      main: purple,
      light: lightGrey,
    },
    text: {
      primary: darkGrey,
      secondary: middleGrey,
    },
    info: {
      main: blue,
      light: purple,
    },
  },
  typography: {
    fontFamily: "Roboto",
  },

  shape: {
    borderRadius: 6,
  },

  overrides: {
    MuiButton: {
      root: {
        color: black,
        "&:hover": {
          backgroundColor: "transparent",
        },
      },
    },

    MuiCssBaseline: {
      "@global": {
        body: {
          backgroundImage: `url(${squiggles}),url(${squiggles})`,
          backgroundColor: backgroundWhite,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "-350px -320px, 1400px 650px",
          overflow: "hidden",
        },
      },
    },

    MuiOutlinedInput: {
      root: {
        height: "50px",
      },
    },
    MuiAccordionSummary: {
      root: {
        "&$expanded": {
          minHeight: "4px",
        },
      },
    },

    MuiCardContent: {
      root: {
        "&:last-child": {
          paddingBottom: "18px",
        },
      },
    },

    MuiAutocomplete: {
      option: {
        '&[data-focus="true"]': {
          backgroundColor: mainGreen,
        },
      },
    },

    MuiContainer: {
      root: {
        marginTop: "25px",
      },
    },

    MuiFormControl: {
      root: {
        display: "flex",
      },
    },

    MuiIconButton: {
      root: {
        "&:hover": {
          backgroundColor: "transparent",
        },
      },
    },

    MuiListItem: {
      button: {
        "&:hover": {
          backgroundColor: "transparent",
        },
      },
    },

    MuiList: {
      root: {
        "&:hover": {
          backgroundColor: white,
        },
      },
    },

    MuiSlider: {
      root: {
        color: black,
        textAlign: "center",
      },
      vertical: {
        height: "auto",
      },
    },

    MuiPopover: {
      root: {
        marginLeft: "20px",
      },
    },

    MuiButtonGroup: {
      root: {
        border: "1px solid #dadde9",
        borderRadius: "9px",
        padding: "8px",
        background: lightGrey,
        width: "63px",
      },
    },
    MuiDivider: {
      root: {
        marginTop: "-15px",
        width: "90%",
        marginLeft: "12px",
        marginBottom: "17px",
      },
    },

    MuiAvatar: {
      rounded: {
        "&:hover": {
          backgroundColor: "transparent",
        },
        display: "contents",
      },
      circular: {
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: mainGreen,
        },
      },
      circle: {
        backgroundColor: mainGreen,
        "&:hover": {
          backgroundColor: white,
        },
      },
    },
  },

  props: {
    MuiIconButton: {
      disableRipple: true,
    },

    MuiButtonGroup: {
      orientation: "vertical",
      variant: "outlined",
      disableRipple: true,
    },

    MuiButtonBase: {
      disableRipple: true,
    },

    MuiPopover: {
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "left",
      },
    },
  },
});

export { ThemeProvider, theme };
