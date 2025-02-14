import { useQuery } from "@apollo/client";
import { X } from "tabler-icons-react"; // Import a close icon
import {
  Badge,
  Card,
  Drawer,
  LoadingOverlay,
  ScrollArea,
  useMantineTheme,
  createStyles,
  Table,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  SimpleGrid,
  Container,
  Pagination,
  Button,
  Tooltip,
  Modal,
  Select,
} from "@mantine/core";
import { FiEdit, FiEye } from "react-icons/fi";
import EditIcon from "@mui/icons-material/Edit";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";
import axios from "axios";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import ManageDepositSlip from "components/Wallet/ManageDepositSlip";
import React, { Fragment, useEffect, useState } from "react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Plus, Search } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import SalesDetailModal from "components/Sales/SalesDetailModal";
import { SalesEditModal } from "components/Sales/SalesUpdateModal";
import { SalesAddModal } from "components/Sales/SalesAddModal";
import { API, PAGE_SIZE_OPTIONS } from "utiles/url";
import Controls from "components/controls/Controls";
import { DatePicker } from "@mantine/dates";
import ProductFilter from "./product";
import RetailerFilter from "./retailer";
import WarehouseFilter from "./warehouse";
import OrdersDetailModal from "./orders";

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
  },
  control: {
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
  icon: {
    width: 15,
    height: 21,
    borderRadius: 21,
  },
  thh: {
    color: "#666666",
    fontFamily: "'__Inter_aaf875','__Inter_Fallback_aaf875'",
    fontSize: "10px",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
}));

function Th({ children, sortable, sorted, reversed, onSort }) {
  const { classes } = useStyles();
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;

  return (
    <th className={classes.th}>
      <UnstyledButton
        onClick={sortable ? onSort : null}
        className={classes.control}
      >
        <Group position="apart" spacing={5}>
          {" "}
          {/* Adjusted spacing here */}
          <Text weight={500} size="sm">
            {children}
          </Text>
          {sortable && (
            <Center className={classes.icon}>
              <Icon size={14} stroke={1.5} />
            </Center>
          )}
        </Group>
      </UnstyledButton>
    </th>
  );
}

const RetailerReport = () => {
  const [size, setSize] = useState("10");
    const handlePageSizeChange = (newSize) => {
      setSize(newSize);
      setActivePage(1);
      fetchData(newSize);
    };
  const { classes } = useStyles();
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [product, setSetProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);

  const [timeRange, setTimeRange] = useState(null);
  const [status, setStatus] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const [sortedData, setSortedData] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData(size);
  }, []);

  const fetchData = async (size) => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API}/reports/retailers?page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setLoading(false);
        setSortedData(response.data.retailerActivity.data);
        setTotalPages(response.data.retailerActivity.last_page);
      }
    } catch (error) {
      setLoading(false);
    }
  };
  const handleFilter = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const startDate = selectedStartDate
        ? selectedStartDate.toISOString().slice(0, 10)
        : "";
      const endDate = selectedEndDate
        ? selectedEndDate.toISOString().slice(0, 10)
        : "";
      const response = await axios.get(
        `${API}/reports/retailers?period=${
          timeRange ? timeRange : "custom"
        }&startDate=${startDate}&endDate=${endDate}&product=${product}&status=${status}&first=${size}`,
        config
      );
      if (response.data) {
        setLoading(false);
        setSortedData(response.data.retailerActivity.data);
        setTotalPages(response.data.retailerActivity.last_page);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSetProduct(null);
    setStatus(null);
    setTimeRange(null);
    fetchData(size);
  };
  const handleChange = (page) => {
    if (
      timeRange ||
      selectedEndDate ||
      selectedStartDate ||
      product ||
      status
    ) {
      setActivePage(page);
      handleFilter();
    } else {
      setActivePage(page);
      fetchData(size);
    }
  };
  const theme = useMantineTheme();
  const handleDetail = (item) => {
    setOpenedDetail(true);
    setData(item);
  };
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.name}</td>
        <td>{row.contact_email}</td>
        <td>{row.contact_phone}</td>
        <td>{row.address}</td>
        <td>{row.region.name.en}</td>
        <td>{row.orders.length}</td>
        <td>
          {" "}
          <Controls.ActionButton
            color="primary"
            title="View Detail"
            onClick={() => handleDetail(row.orders)}
          >
            <FiEye fontSize="medium" />
          </Controls.ActionButton>
        </td>
      </tr>
    </Fragment>
  ));
  return (
    <div style={{ width: "98%", margin: "auto" }}>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />

      <div>
        <SimpleGrid cols={5}>
          <div>
            <Select
              data={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
              ]}
              value={timeRange}
              onChange={setTimeRange}
              label="Select Period"
              placeholder="Select Range"
              withinPortal
              clearable
            />
          </div>
          <div>
            <DatePicker
              value={selectedStartDate}
              onChange={setSelectedStartDate}
              placeholder="Pick a date"
              label="Select Start Date"
              clearable
            />
          </div>
          <div>
            <DatePicker
              value={selectedEndDate}
              onChange={setSelectedEndDate}
              placeholder="Pick a date"
              label="Select End Date"
              clearable
            />
          </div>
          <div>
            <ProductFilter category={product} onCardClick={setSetProduct} />
          </div>
          <div>
            <Select
              data={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={status}
              onChange={setStatus}
              label="Select Status"
              placeholder="Select Status"
              withinPortal
              clearable
            />
          </div>
        </SimpleGrid>
        {(timeRange ||
          selectedEndDate ||
          selectedStartDate ||
          product ||
          status) && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <Button
              onClick={handleReset}
              style={{
                width: "80px",
                marginRight: "10px",
                backgroundColor: "#FF6A00",
                color: "#FFFFFF",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFilter}
              style={{
                width: "80px",
                backgroundColor: "#FF6A00",
                color: "#FFFFFF",
              }}
            >
              Filter
            </Button>
          </div>
        )}
      </div>

      <Drawer
        opened={openedDetail}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Retailer Orders Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <OrdersDetailModal
        data={data}
        />
      </Drawer>
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <Table
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ minWidth: 700, marginTop: "10px" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <Th>
                  <span className={classes.thh}>Name</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Email</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Phone</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Address</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Region</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Orders</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Action</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows?.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan={10}>
                    <Text weight={500} align="center">
                      Nothing found
                    </Text>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
         
                   <Center mt="md">
                     <Group spacing="xs" position="center">
                       <Group spacing="sm">
                         <Text size="sm" mt="sm">
                           <span style={{ color: "#FF6A00", marginBottom: "10px" }}>
                             Show per page:
                           </span>
                         </Text>
                         <Select
                           value={size}
                           onChange={handlePageSizeChange}
                           data={PAGE_SIZE_OPTIONS}
                           style={{ width: 80, height: 40 }}
                         />
                       </Group>
                       <Pagination
                         color="blue"
                         page={activePage}
                         onChange={handleChange}
                         total={totalPages}
                       />
                     </Group>
                   </Center>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default RetailerReport;
