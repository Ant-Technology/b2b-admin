import React, { useEffect, useState } from "react";
import { createStyles, Navbar, Tooltip, Badge, Collapse } from "@mantine/core";
import Pusher from "pusher-js";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import {
  IconDashboard,
  IconApps,
  IconShoppingCart,
  IconGeometry,
  IconBuildingWarehouse,
  IconCurrentLocation,
  IconBrandShopee,
  IconLayoutDistributeHorizontal,
  IconBuildingStore,
  IconShip,
  IconWallet,
  IconTruck,
  IconTruckDelivery,
  IconUser,
  IconUsers,
  IconTruckLoading,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons";

import { Link, useNavigate } from "react-router-dom";
import { authDataVar } from "apollo/store";
import { useMutation } from "@apollo/client";
import { LOGOUT } from "apollo/mutuations";
import {
  NotificationsProvider,
  showNotification,
} from "@mantine/notifications";
import NotificationExample from "./showNotification";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    bg: {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.gray : "#ffffff",
    },
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark" ? theme.colors.dark[1] : "rgb(20, 61, 89)",
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 600,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[2],
        color: theme.colorScheme === "dark" ? theme.white : "#333333",

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : "#333333",
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark" ? theme.colors.dark[2] : "rgb(20, 61, 89)",
      marginRight: theme.spacing.sm,
    },

    linkIconShort: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      margin: "auto",
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: "#FF6A00", // Background color
        color: "#FFFFFF", // Text color
        [`& .${icon}`]: {
          color: "#FFFFFF", // Icon color
        },
      },
    },
  };
});
const data = [
  { link: "/", label: "Dashboard", icon: IconDashboard },
  { link: "/dropoffs", label: "Drop Offs", icon: IconTruckLoading },
  {
    link: "/orders",
    label: "Orders",
    icon: IconShoppingCart,
  },
  { link: "/shipments", label: "Shipments", icon: IconShip },
  { link: "/wallets", label: "Wallet", icon: IconWallet },
  { link: "/users", label: "User Management", icon: IconUsers },
  { link: "/categories", label: "Categories", icon: IconApps },
  { link: "/products", label: "Products", icon: IconShoppingCart },
  { link: "/productvariants", label: "Product Variant", icon: IconGeometry },
  { link: "/warehouses", label: "Ware House", icon: IconBuildingWarehouse },
  { link: "/regions", label: "Regions", icon: IconCurrentLocation },
  { link: "/retailers", label: "Retailers", icon: IconBrandShopee },
  { link: "/drivers", label: "Drivers", icon: IconUser },
  { link: "/vehicle_types", label: "Vehicle Types", icon: IconTruck },
  { link: "/vehicles", label: "Vehicles", icon: IconTruckDelivery },
  {
    link: "/distributors",
    label: "Distributers",
    icon: IconLayoutDistributeHorizontal,
  },
  { link: "/stocks", label: "Stocks", icon: IconBuildingStore },
  { link: "/sales", label: "Sales", icon: IconUser },
  {
    label: "Feedback",
    icon: FeedbackIcon,
    initiallyOpened: false,
    links: [
      { link: "/feedbacks", label: "Feedbacks" },
      { link: "/feedback-types", label: "Feedback Types" },
    ],
  },
];

const NavbarSimple = ({ opened, setOpened, setPosition }) => {
  const { width } = useViewportSize();

  const { classes, cx, theme } = useStyles();

  const mobScreen = useMediaQuery("(max-width: 500px)");

  const [active, setActive] = useState("Billing");
  const [orderCount, setOrderCount] = useState(
    localStorage.getItem("orderCount") || 0
  );
  const [shipments, setShipments] = useState(
    localStorage.getItem("shipments") || 0
  );
  const [wallets, setWallets] = useState(localStorage.getItem("wallets") || 0);
  const [dropoffs, setDrppoffs] = useState(
    localStorage.getItem("dropoffs") || 0
  );

  const navigate = useNavigate();
  const [signout] = useMutation(LOGOUT);
  const [collapseOpened, setCollapseOpened] = useState(false);

  useEffect(() => {
    const pusher = new Pusher("83f49852817c6b52294f", {
      cluster: "mt1",
    });

    const channel = pusher.subscribe("nav-counter");
    const notificationChannel = pusher.subscribe("notification");

    // Bind to a test event
    channel.bind("nav-counter", function (data) {
      localStorage.setItem("orderCount", data.data.orders);
      localStorage.setItem("wallets", data.data.wallets);
      localStorage.setItem("shipments", data.data.shipments);
      localStorage.setItem("dropoffs", data.data.drop_offs);
      console.log(data.data);
      setOrderCount(data.data.orders);
      setWallets(data.data.wallets);
      setShipments(data.data.shipments);
      setDrppoffs(data.data.drop_offs);
    });

    notificationChannel.bind("new-item-created", function (data) {
      showNotification({
        color: data.type === "Error" ? "red" : "green",
        title: data.type,
        message: data.message,
        position: {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
        autoClose: 5000, // Disable auto close
        // Adjust the duration time here (in milliseconds)
      });
    });
    setPosition(null);
    return () => {
      // Unsubscribe from channels, disconnect, etc.
      pusher.disconnect();
    };
  }, []); //notification

  const links = data.map((item, index) => (
    <React.Fragment key={index}>
      {item.links ? (
        <>
          <div
            className={cx(classes.link, {
              [classes.linkActive]: item.label === active,
            })}
            onClick={() => setCollapseOpened((o) => !o)}
          >
            {item.icon && (
              <item.icon
                className={opened ? classes.linkIcon : classes.linkIconShort}
                stroke={1.5}
              />
            )}
            <div style={{ overflow: "hidden" }}>
              {opened ? (
                <span>
                  {item.label}
                  <Badge
                    style={{ marginLeft: "10px"}}
                    size="xs"
                    variant="filled"
                  >
                    {collapseOpened ? (
                      <IconChevronUp size={16} />
                    ) : (
                      <IconChevronDown size={16} />
                    )}
                  </Badge>
                </span>
              ) : null}
            </div>
          </div>
          <Collapse in={collapseOpened}>
            {item.links.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                className={cx(classes.link, {
                  [classes.linkActive]: subItem.label === active,
                })}
                to={subItem.link}
                onClick={(event) => {
                  event.preventDefault();
                  setActive(subItem.label);
                  navigate(subItem.link);
                }}
                style={{ paddingLeft: theme.spacing.lg }}
              >
                {subItem.icon&&
                <subItem.icon
                  className={opened ? classes.linkIcon : classes.linkIconShort}
                  stroke={1.5}
                />
}
                <div style={{ overflow: "hidden" }}>
                  {opened ? <span>{subItem.label}</span> : null}
                </div>
              </Link>
            ))}
          </Collapse>
        </>
      ) : (
        <>
          {opened ? (
            <Link
              className={cx(classes.link, {
                [classes.linkActive]: item.label === active,
              })}
              to={item.link}
              onClick={(event) => {
                event.preventDefault();
                setActive(item.label);
                navigate(item.link);
              }}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <item.icon
                className={opened ? classes.linkIcon : classes.linkIconShort}
                stroke={1.5}
              />
              <div style={{ overflow: "hidden" }}>
                {opened ? (
                  <span>
                    {item.label}{" "}
                    {item.link === "/orders" &&
                      orderCount &&
                      parseInt(orderCount) > 0 && (
                        <Badge
                          style={{
                            backgroundColor: "#FF6A00",
                            marginLeft: "15px",
                            color: "#FFFFFF",
                          }}
                          size="md"
                          variant="danger"
                          circle
                        >
                          {orderCount}
                        </Badge>
                      )}
                    {item.link === "/shipments" &&
                      shipments &&
                      parseInt(shipments) > 0 && (
                        <Badge
                          style={{
                            backgroundColor: "#FF6A00",
                            marginLeft: "15px",
                            color: "#FFFFFF",
                          }}
                          size="md"
                          variant="danger"
                          circle
                        >
                          {shipments}
                        </Badge>
                      )}
                    {item.link === "/wallets" &&
                      wallets &&
                      parseInt(wallets) > 0 && (
                        <Badge
                          style={{
                            backgroundColor: "#FF6A00",
                            marginLeft: "15px",
                            color: "#FFFFFF",
                          }}
                          size="md"
                          variant="danger"
                          circle
                        >
                          {wallets}
                        </Badge>
                      )}
                    {item.link === "/dropoffs" &&
                      dropoffs &&
                      parseInt(dropoffs) > 0 && (
                        <Badge
                          style={{
                            backgroundColor: "#FF6A00",
                            marginLeft: "15px",
                            color: "#FFFFFF",
                          }}
                          size="md"
                          variant="danger"
                          circle
                        >
                          {dropoffs}
                        </Badge>
                      )}
                  </span>
                ) : null}
              </div>
            </Link>
          ) : (
            <Tooltip
              key={index}
              label={!opened ? item.label : null}
              position="right"
              withArrow
            >
              <Link
                key={index}
                className={cx(classes.link, {
                  [classes.linkActive]: item.label === active,
                })}
                to={item.link}
                onClick={(event) => {
                  event.preventDefault();
                  setActive(item.label);
                  navigate(item.link);
                }}
              >
                <item.icon
                  className={opened ? classes.linkIcon : classes.linkIconShort}
                  stroke={1.5}
                />
                <div style={{ overflow: "hidden" }}>
                  {opened ? <span>{item.label}</span> : null}
                </div>
              </Link>
            </Tooltip>
          )}
        </>
      )}
    </React.Fragment>
  ));

  const handleNameAvatar = () => {
    if (authDataVar().auth) {
      const text = authDataVar().auth.name;
      const new_splitted_text = text.split(" ");
      // alert(new_splitted_text[0]);
      const NL = new_splitted_text[0].charAt(0);
      const FL = new_splitted_text[1].charAt(0);

      return NL + " " + FL;
    }
  };

  return (
    <Navbar
      style={{
        maxWidth: opened ? (mobScreen ? "100%" : width / 5) : width / 14,
        transition: "all .2s ease-in",
      }}
      p="md"
      className={classes.bg}
    >
      <Navbar.Section mt="xs"></Navbar.Section>

      <Navbar.Section
        grow
        style={{
          overflowY: "auto",
          maxHeight: "calc(100vh - 100px)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(155, 155, 155, 0.5) rgba(255, 255, 255, 0.1)",
          scrollbarTrackColor: "rgba(255, 255, 255, 0.1)",
          scrollbarThumbColor: "rgba(155, 155, 155, 0.5)",
          WebkitScrollbarWidth: "2px", // Adjust this value as needed
        }}
      >
        {links}
      </Navbar.Section>
    </Navbar>
  );
};

export default NavbarSimple;
