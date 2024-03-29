import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Drawer,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { DEL_DRIVER } from "apollo/mutuations";
import { GET_DRIVERS } from "apollo/queries";
import { DriverAddModal } from "components/Driver/DriverAddModal";
import DriverDetailModal from "components/Driver/DriverDetail";
import { DriverEditModal } from "components/Driver/DriverEditModal";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import React, { useState } from "react";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";

const Drivers = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading } = useQuery(GET_DRIVERS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.drivers.paginatorInfo.lastPage);
  }

  const [delDriver] = useMutation(DEL_DRIVER, {
    update(cache, { data: { deleteDriver } }) {
      cache.updateQuery(
        {
          query: GET_DRIVERS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.drivers.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              drivers: {
                data: [
                  ...data.drivers.data.filter(
                    (driver) => driver.id !== deleteDriver.id
                  ),
                ],
              },
            };
          }
        }
      );
    },
  });

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };
  const [isTrashHovered, setIsTrashHovered] = useState(false);
  const [isEditHovered, setIsEditHovered] = useState(false);

  const deleteDriver = () => {
    delDriver({
      variables: { id: deleteID },
      refetchQueries: [
        {
          query: GET_DRIVERS,
          variables: {
            first: 10,
            page: 1,
          },
        },
      ],
      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Driver Deleted Successfully",
        });
      },
      onError(error) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "red",
          title: "Error",
          message: `${error}`,
        });
      },
    });
  };

  const handleEditDriver = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };
  const [isHovered, setIsHovered] = useState(false);
  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };
  const handleManageDriver = (id) => {
    setEditId(id);
    setOpenedDetail(true);
  };
  const theme = useMantineTheme();

  const headerData = [
    {
      label: "id",
      key: "id",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.id}</span>;
      },
    },
    {
      label: "Name",
      key: "name",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.name}</span>;
      },
    },
    {
      label: "City",
      key: "city",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.city}</span>;
      },
    },
    {
      label: "Email",
      key: "email",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.email}</span>;
      },
    },
    {
      label: "Phone",
      key: "phone",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span style={{ marginLeft: "30px" }}>{rowData.phone}</span>;
      },
    },
    {
      label: "Orders",
      key: "city",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>33</span>;
      },
    },
    {
      label: "Actions",
      key: "actions",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <>
            <div
              style={{
                position: "relative",
                display: "inline-block",
              }}
            >
              <Trash
                color="#ed522f"
                size={24}
                onClick={() => handleDelete(`${rowData.id}`)}
                onMouseEnter={() => setIsTrashHovered(true)}
                onMouseLeave={() => setIsTrashHovered(false)}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.3s, box-shadow 0.3s",
                  opacity: isTrashHovered ? 0.8 : 1,
                  boxShadow: isTrashHovered
                    ? "0 0 10px rgba(0, 0, 0, 0.3)"
                    : "none",
                }}
              />
            </div>
            <Edit
              size={24}
              onClick={() => handleEditDriver(`${rowData.id}`)}
              onMouseEnter={() => setIsEditHovered(true)}
              onMouseLeave={() => setIsEditHovered(false)}
              style={{
                cursor: "pointer",
                marginLeft: "10px",
                transition: "opacity 0.3s, box-shadow 0.3s",
                opacity: isEditHovered ? 0.8 : 1,
                boxShadow: isEditHovered
                  ? "0 0 10px rgba(0, 0, 0, 0.3)"
                  : "none",
              }}
            />
            <ManualGearbox
              color="#1971C2"
              style={{
                cursor: "pointer",
                marginLeft: "10px",
              }}
              size={24}
              onClick={() => handleManageDriver(`${rowData.id}`)}
            />
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Driver",
    setAddModal: setOpened,
  };
  return loading ? (
    <LoadingOverlay
      visible={loading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <div style={{ width: "98%", margin: "auto" }}>
      <Drawer
        opened={openedEdit}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Editing a Driver"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <DriverEditModal setOpenedEdit={setOpenedEdit} editId={editId} />
      </Drawer>

      <Drawer
        opened={openedDetail}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Driver Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <DriverDetailModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpenedDetail={setOpenedDetail}
          Id={editId}
        />
      </Drawer>
      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this Driver?</p>
        <Group position="right">
          <Tooltip label="Delete" position="right" withArrow>
            <Button onClick={() => deleteDriver()} color="red">
              Delete
            </Button>
          </Tooltip>
        </Group>
      </Modal>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding a Driver"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <DriverAddModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
        />
      </Drawer>

      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            optionsData={optionsData}
            loading={loading}
            data={data ? data.drivers.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Drivers;
