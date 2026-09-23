const url = process.env.NEXT_PUBLIC_URL;
const uri = process.env.NEXT_PUBLIC_URI;

const exports = {
  store_name: "direct_download",
  baseURL: `${url}/graphql`,
  uri: uri,
  data: {
    configs: {
      translate: "fa",
      colors: {
        primary: "#0ea960",
        primary_start: "#0ea960",
        primary_end: "#008844",
        red_color: "#FF2400",
        green_color: "#309334",
        red_error: "#CC0000",
        rgba0: "rgba(14,169,96,0.9)",
        rgba1: "rgba(14,169,96,0.7)",
        rgba2: "rgba(14,169,96,0.3)",
        rgba3: "rgba(14,169,96,0.1)",
        rgba4: "rgba(14,169,96,0.05)",
      },
      alert: {
        icon_type: "lottie",
        success: {
          gradient_start: "#007E33",
          gradient_end: "#00C851",
          icon: "check",
        },
        alert: {
          gradient_start: "#CC0000",
          gradient_end: "#ff4444",
          icon: "times",
        },
        info: {
          gradient_start: "#0099CC",
          gradient_end: "#33b5e5",
          icon: "info",
        },
        warn: {
          gradient_start: "#FF8800",
          gradient_end: "#ffbb33",
          icon: "exclamation",
        },
        question: {
          gradient_start: "#FF8800",
          gradient_end: "#ffbb33",
          icon: "question",
        },
      },
    },
  },
};

export default exports;
