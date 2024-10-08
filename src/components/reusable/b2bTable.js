import { useState, useEffect, Fragment } from "react";
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  LoadingOverlay,
  SimpleGrid,
  Container,
  Pagination,
  Button,
  Tooltip,
  Select,
} from "@mantine/core";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { customLoader } from "components/utilities/loader";
import { Plus, Search } from "tabler-icons-react";
import { PAGE_SIZE_OPTIONS } from "utiles/url";

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
    width: 21,
    height: 21,
    borderRadius: 21,
  },
}));

function Th({ children, reversed, sorted, onSort }) {
  const { classes } = useStyles();
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text weight={500} size="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={14} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}
function filterData(data, search) {
  const query = search.toLowerCase().trim();
  
  return data.filter((item) => {
    return Object.keys(item).some((key) => {
      const value = item[key];

      if (typeof value === "string") {
        return value.toLowerCase().includes(query);
      }

      if (key === 'causer' && value && typeof value === "object") {
        // Specifically check for causer.name
        return value.name?.toLowerCase().includes(query);
      }

      if (typeof value === "object" && value !== null) {
        return Object.values(value).some(val =>
          typeof val === "string" && val.toLowerCase().includes(query)
        );
      }

      return false;
    });
  });
}

function sortData(data, payload) {
  if (!payload.sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      let aValue = a[payload.sortBy];
      let bValue = b[payload.sortBy];

      // Special case for causer.name
      if (payload.sortBy === 'causer') {
        aValue = a.causer?.name || '';  // Get causer.name or empty string
        bValue = b.causer?.name || '';
      }

      const aStr = aValue !== null && aValue !== undefined ? String(aValue) : '';
      const bStr = bValue !== null && bValue !== undefined ? String(bValue) : '';

      if (payload.sortBy === "cost" || payload.sortBy === "total_price") {
        const aNum = parseFloat(aStr);
        const bNum = parseFloat(bStr);
        return payload.reversed ? bNum - aNum : aNum - bNum;
      } else {
        return payload.reversed ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
      }
    }),
    payload.search
  );
}

const B2bTable = ({
  data,
  header,
  loading,
  optionsData,
  total,
  content,
  activePage,
  handleChange,
  collapsible,
  selectedCollapse,
  setSelectedCollapse,
  size,
  handlePageSizeChange
}) => {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState(null);

  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    console.log("Search input:", value); // Debugging log
    setSearch(value);
    setSortedData(
      sortData(data, { sortBy, reversed: reverseSortDirection, search: value })
    );
  };

  const rows = sortedData.map((row) => (
    <Fragment key={row.id}>
      <tr>
        {header.map((data, index) => (
          <td key={index} style={{ width: "20%" }}>
            {data?.render(row)}
          </td>
        ))}
      </tr>
      {row.id === selectedCollapse && collapsible && content(row)}
    </Fragment>
  ));

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  return (
    <ScrollArea>
      <SimpleGrid cols={3}>
        {optionsData ? (
          <div>
            <Button
              onClick={() => optionsData.setAddModal(true)}
              style={{ backgroundColor: "#FF6A00", color: "#FFFFFF" }}
              leftIcon={<Plus size={14} />}
            >
              {optionsData.actionLabel}
            </Button>
          </div>
        ) : (
          <div></div>
        )}
        <div> </div>
        <div>
          <TextInput
            placeholder="Search by any field"
            mb="md"
            icon={<Search size={14} />}
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </SimpleGrid>
      <Table
        highlightOnHover
        horizontalSpacing="md"
        verticalSpacing="xs"
        sx={{ tableLayout: "fixed", minWidth: 700 }}
      >
        <LoadingOverlay
          visible={loading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <thead style={{ backgroundColor: "#F1F1F1" }}>
          <tr>
            {header.map((th, index) => {
              return th.sortable ? (
                <Th
                  key={th.label}
                  sorted={sortBy === th.key}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting(th.key)}
                >
                  <span
                    style={{
                      color: "#666666",
                      fontFamily: "'__Inter_aaf875','__Inter_Fallback_aaf875'",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {th.label}
                  </span>
                </Th>
              ) : (
                <th
                  style={{
                    color: "#666666",
                    fontFamily: "'__Inter_aaf875','__Inter_Fallback_aaf875'",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                  key={th.label}
                >
                  {th.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={header.length}>
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
            <span style={{color:"#FF6A00",marginBottom:"10px"}}>Show per page:</span>
            </Text>
            <Select
              value={size}
              onChange={handlePageSizeChange} // Call parent handler for page size change
              data={PAGE_SIZE_OPTIONS}
              style={{ width: 80,height:40 }}
            />
          </Group>
          <Pagination
            color="blue"
            page={activePage}
            onChange={handleChange}
            total={total}
          />
        </Group>
      </Center>
    </ScrollArea>
  );
};

export default B2bTable;
