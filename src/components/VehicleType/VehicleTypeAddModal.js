import { useMutation } from "@apollo/client";
import {
  Button,
  Grid,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { CREATE_VEHICLE_TYPE } from "apollo/mutuations";
import { GET_VEHICLE_TYPES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { tabList } from "components/utilities/tablist";
import React, { useEffect, useRef, useState } from "react";
import { Photo, PictureInPicture, Upload } from "tabler-icons-react";

const VehicleTypeAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const [files, setFiles] = useState([]);
  const [typeDropDownData, setTypeDropDownData] = useState([]);

  useEffect(() => {
    let types = ["Shipment", "Dropoff"];
    let type = [];

    // loop over regions data to structure the data for the use of drop down
    types.forEach((item, index) => {
      type.push({
        label: item,
        value: item,
      });
    });

    // put it on the state
    setTypeDropDownData([...type]);
  }, []);
  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <img
        key={index}
        src={imageUrl}
        alt=""
        width="130"
        imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  });

  const theme = useMantineTheme();
  //form initialization and validation
  const form = useForm({
    initialValues: {
      title: { en: "", am: "" },
      starting_price: "",
      price_per_kilometer: "",
      type: "",
    },
  });
  const fileInputRef = useRef(null);
  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };
  const [addVehicleType, { loading }] = useMutation(CREATE_VEHICLE_TYPE, {
    update(cache, { data: { createVehicleType } }) {
      cache.updateQuery(
        {
          query: GET_VEHICLE_TYPES,
          variables: {
            first: 10,
            page: activePage,
            search: ""
          },
        },
        (data) => {
          if (data.vehicleTypes.data.length === 10) {
            setTotal(total + 1);
            setActivePage(total + 1);
          } else {
            return {
              vehicleTypes: {
                data: [createVehicleType, ...data.vehicleTypes.data],
              },
            };
          }
        }
      );
    },
  });

  const submit = () => {
    addVehicleType({
      variables: {
        title: form.getInputProps("title").value,
        image: files[files.length - 1],
        type: form.getInputProps("type").value,
        starting_price: parseFloat(form.values.starting_price),
        price_per_kilometer: parseFloat(form.values.price_per_kilometer),
      },
      onCompleted() {
        showNotification({
          color: "green",
          title: "Success",
          message: "Vehicle Type Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        showNotification({
          color: "red",
          title: "Error",
          message: `${error}`,
        });
      },
    });
  };

  const { height } = useViewportSize();
  const setTypeDropDownValue = (val) => {
    form.setFieldValue("type", val);
  };

  return (
    <Tabs color="blue" value={activeTab} onTabChange={setActiveTab}>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />

      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Vehicle Type (English)"
                  placeholder="Enter Vehicle Type in English"
                  {...form.getInputProps("title.en")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Vehicle Type (Amharic)"
                  placeholder="Enter Vehicle Type in Amharic"
                  {...form.getInputProps("title.am")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  data={typeDropDownData}
                  value={form.getInputProps("type")?.value.toString()}
                  onChange={setTypeDropDownValue}
                  label="Type"
                  placeholder="Pick a Type this Vehicle Type belongs to"
                />
                <TextInput
                  required
                  label="Starting Price"
                  placeholder="Starting Price"
                  type="number"
                  {...form.getInputProps("starting_price")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Price Per Kilometer"
                  placeholder="Price Per Kilometer"
                  type="number"
                  {...form.getInputProps("price_per_kilometer")}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={12}>
                <div>
                  <Button
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      marginTop: "5px",
                      width: "20%",
                      backgroundColor: "#FF6A00",
                      color: "#FFFFFF",
                    }}
                    fullWidth
                    color="blue"
                  >
                    Upload Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <SimpleGrid
                    cols={4}
                    breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                    mt={previews.length > 0 ? "xl" : 0}
                  >
                    {previews}
                  </SimpleGrid>
                </div>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={12}>
                <Button
                  type="submit"
                  style={{
                    marginTop: "10px",
                    width: "20%",
                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                  }}
                  fullWidth
                  color="blue"
                >
                  Submit
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </ScrollArea>
    </Tabs>
  );
};

export default VehicleTypeAddModal;
