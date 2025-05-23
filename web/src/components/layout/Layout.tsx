import { ReactNode, useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { SideBar } from "./SideBar";
import { TopBar } from "./TopBar";
import { useMediaQuery, useTheme } from "@mui/material";

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
});

export const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      className={roboto.className}
      sx={{
        display: "flex",
        backgroundColor: (theme) => theme.palette.grey[100],
        minHeight: "100vh",
      }}
    >
      <TopBar
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
      />
      <SideBar
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          maxWidth: "100%",
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* {!isMd && <Toolbar />} */}

        {children}
      </Box>
    </Box>
  );
};
