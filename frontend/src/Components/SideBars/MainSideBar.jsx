import React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Collapse } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import Theme from "../../Theme/Theme";
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined";
import ReceiptIcon from "@mui/icons-material/ReceiptOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalculateIcon from "@mui/icons-material/Calculate";


export default function MainSideBar() {
  const location = useLocation();

  const isSelected = (path) => {
    return location.pathname === path;
  };
  const primaryColor = Theme.palette.primary.main;
  const secondaryColor = "text.secondary";
  const [openInventory, setOpenInventory] = React.useState(false);
  const [openEmployee, setOpenEmployee] = React.useState(false);
  const [openFinance, setOpenFinance] = React.useState(false);
  const [openReport, setOpenReport] = React.useState(false);
  const [openSetting , setOpenSetting] = React.useState(false)

  const handleInventoryClick = () => {
    setOpenInventory(!openInventory);
  };
  const handleFinanceClick = () => {
    setOpenFinance(!openFinance);
  };
  const handleEmployeeClick = () => {
    setOpenEmployee(!openEmployee);
  };
  const handleReportClick = () => {
    setOpenReport(!openReport);
  };
  const handleSettinglick = () => {
    setOpenSetting(!openSetting);
  };
  return (
    <Box
      sx={{
        bgcolor: "background.default",
      }}
    >
      <List dense sx={{ paddingX: 2 }}>

        {/* price card section */}
        <ListItemButton
          component={Link}
          to={"/price"}
          selected={isSelected("/price")}
        >
          <ListItemIcon
            sx={{
              color: isSelected("/price") ? primaryColor : secondaryColor,
            }}
          >
            <PriceChangeOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Timber Prices"
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color: isSelected("/price") ? primaryColor : secondaryColor,
            }}
          />
        </ListItemButton>


        {/* bill and order section */}
        <ListItemButton
          component={Link}
          to={"/bill"}
          selected={isSelected("/bill")}
        >
          <ListItemIcon
            sx={{
              color: isSelected("/bill") ? primaryColor : secondaryColor,
            }}
          >
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color: isSelected("/bill") ? primaryColor : secondaryColor,
            }}
            primary="Bill and Order"
          />
        </ListItemButton>


        {/* employee management section */}
        <ListItemButton
          onClick={handleEmployeeClick}
          selected={isSelected("/employee") || isSelected("/employee/daily")}
        >
          <ListItemIcon
            sx={{
              color:
                isSelected("/employee") || isSelected("/employee/daily")
                  ? primaryColor
                  : secondaryColor,
            }}
          >
            <BadgeIcon />
          </ListItemIcon>
          <ListItemText
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color:
                isSelected("/employee") || isSelected("/employee/daily")
                  ? primaryColor
                  : secondaryColor,
            }}
            primary="Employee"
          />
        </ListItemButton>
        <Collapse in={openEmployee} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton component={Link} to={"/employee"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Employee Details"
                primaryTypographyProps={{
                  color: isSelected("/employee")
                    ? primaryColor
                    : secondaryColor,
                }}
              />
            </ListItemButton>
            <ListItemButton component={Link} to={"/employee/daily"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Daily Records"
                primaryTypographyProps={{
                  color: isSelected("/employee/daily")
                    ? primaryColor
                    : secondaryColor,
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>


        {/* inventory section */}
        <ListItemButton
          onClick={handleInventoryClick}
          selected={isSelected("/load") || isSelected("/activeStock")}
        >
          <ListItemIcon
            sx={{
              color:
                isSelected("/load") || isSelected("/activeStock")
                  ? primaryColor
                  : secondaryColor,
            }}
          >
            <Inventory2OutlinedIcon />
          </ListItemIcon>
          <ListItemText
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color:
                isSelected("/load") || isSelected("/activeStock")
                  ? primaryColor
                  : secondaryColor,
            }}
            primary="Inventory"
          />
        </ListItemButton>
        <Collapse in={openInventory} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton component={Link} to={"/load"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Load"
                primaryTypographyProps={{
                  color: isSelected("/load") ? primaryColor : secondaryColor,
                }}
              />
            </ListItemButton>
            <ListItemButton component={Link} to={"/activeStock"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Stock"
                primaryTypographyProps={{
                  color: isSelected("/activeStock")
                    ? primaryColor
                    : secondaryColor,
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>


        {/* Machine section */}
        <ListItemButton selected={isSelected("/Machine")}>
          <ListItemIcon
            sx={{
              color: isSelected("/Machine") ? primaryColor : secondaryColor,
            }}
          >
            <PrecisionManufacturingOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color: isSelected("/Machine") ? primaryColor : secondaryColor,
            }}
            primary="Machine"
          />
        </ListItemButton>


        {/* Finace section */}
        <ListItemButton
          onClick={handleFinanceClick}
          selected={isSelected("/income") || isSelected("/exp")}
        >
          <ListItemIcon
            sx={{
              color:
                isSelected("/income") || isSelected("/exp")
                  ? primaryColor
                  : secondaryColor,
            }}
          >
            <AccountBalanceOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color:
                isSelected("/income") || isSelected("/exp")
                  ? primaryColor
                  : secondaryColor,
            }}
            primary="Finance"
          />
        </ListItemButton>
        <Collapse in={openFinance} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton component={Link} to={"/income"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Income"
                primaryTypographyProps={{
                  color: isSelected("/income") ? primaryColor : secondaryColor,
                }}
              />
            </ListItemButton>
            <ListItemButton component={Link} to={"/exp"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Expenses"
                primaryTypographyProps={{
                  color: isSelected("/exp") ? primaryColor : secondaryColor,
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>


       {/* report section */}
        <ListItemButton
          onClick={handleReportClick}
          selected={isSelected("/stockSummary") || isSelected("/expSummary")}
        >
          <ListItemIcon
            sx={{
              color:
                isSelected("/stockSummary") || isSelected("/expSummary")
                  ? primaryColor
                  : secondaryColor,
            }}
          >
            <AssessmentIcon/>
          </ListItemIcon>
          <ListItemText
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color:
                isSelected("/stockSummary") || isSelected("/expSummary")
                  ? primaryColor
                  : secondaryColor,
            }}
            primary="Report and Summary"
          />
        </ListItemButton>
        <Collapse in={openReport} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton component={Link} to={"/stockSummary"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Stock Summary"
                primaryTypographyProps={{
                  color: isSelected("/stockSummary")
                    ? primaryColor
                    : secondaryColor,
                }}
              />
            </ListItemButton>
            <ListItemButton component={Link} to={"/expSummary"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Expenses Summary"
                primaryTypographyProps={{
                  color: isSelected("/expSummary") ? primaryColor : secondaryColor,
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>


        {/* setting section */}
        <ListItemButton
          onClick={handleSettinglick}
          selected={isSelected("/setting/treeType") || isSelected("/setting/timberNature") || isSelected("/setting/incomeType") || isSelected("/setting/expenseType")}
        >
          <ListItemIcon
            sx={{
              color:
              isSelected("/setting/treeType") || isSelected("/setting/timberNature") || isSelected("/setting/incomeType") || isSelected("/setting/expenseType")
                  ? primaryColor
                  : secondaryColor,
            }}
          >
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color:
              isSelected("/setting/treeType") || isSelected("/setting/timberNature") || isSelected("/setting/incomeType") || isSelected("/setting/expenseType")
                  ? primaryColor
                  : secondaryColor,
            }}
            primary="Settings"
          />
        </ListItemButton>
        <Collapse in={openSetting} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton component={Link} to={"/setting/treeType"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Tree type"
                primaryTypographyProps={{
                  color: isSelected("/setting/treeType")
                    ? primaryColor
                    : secondaryColor,
                }}
              />
            </ListItemButton>
            <ListItemButton component={Link} to={"/setting/timberNature"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Timber Nature"
                primaryTypographyProps={{
                  color: isSelected("/setting/timberNature")
                    ? primaryColor
                    : secondaryColor,
                }}
              />
            </ListItemButton>
            <ListItemButton component={Link} to={"/setting/incomeType"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Income Type"
                primaryTypographyProps={{
                  color: isSelected("/setting/incomeType")
                    ? primaryColor
                    : secondaryColor,
                }}
              />
            </ListItemButton>
            <ListItemButton component={Link} to={"/setting/expenseType"}>
              <ListItemIcon></ListItemIcon>
              <ListItemText
                primary="Expense Type"
                primaryTypographyProps={{
                  color: isSelected("/setting/expenseType")
                    ? primaryColor
                    : secondaryColor,
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>


        {/* cubic calculate section */}
        <ListItemButton
          component={Link}
          to={"/cubicCalc"}
          selected={isSelected("/cubicCalc")}
        >
          <ListItemIcon
            sx={{
              color: isSelected("/cubicCalc") ? primaryColor : secondaryColor,
            }}
          >
            <CalculateIcon />
          </ListItemIcon>
          <ListItemText
            primary="Cubic Calculator"
            sx={{ marginLeft: "-18px" }}
            primaryTypographyProps={{
              color: isSelected("/cubicCalc") ? primaryColor : secondaryColor,
            }}
          />
        </ListItemButton>
        
      </List>
    </Box>
  );
}
