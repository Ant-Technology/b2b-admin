import {
  TextInput,
  Grid,
  Button,
  ScrollArea,
  LoadingOverlay,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import Map from "components/utilities/Map";
import { customLoader } from "components/utilities/loader";
import { CREATE_WARE_HOUSE } from "../../apollo/mutuations";
import { GET_REGIONS, GET_WARE_HOUSES } from "../../apollo/queries";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  Autocomplete,
} from "@react-google-maps/api";
import ContentLoader from "react-content-loader";

// TODO: change map key env variable

const Loader = () => (
  <ContentLoader
    width="100%"
    height={400}
    backgroundColor="#f0f0f0"
    foregroundColor="#dedede"
  >
    <rect width="100%" height="400px" />
  </ContentLoader>
);

const containerStyle = {
  width: "100%",
  height: "400px",
};
//AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk
const GOOGLE_API_KEY = "AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk";
const libraries = ["places"];

export default function WarehouseAddModal({
  trigger,
  total,
  setTotal,
  setOpened,
  activePage,
  setActivePage,
}) {
  const [location, setLocation] = useState({});
  const [center, setCenter] = useState({ lat: 8.9999645, lng: 38.7700539 });
  const [autocomplete, setAutocomplete] = useState();
  const [mapRef, setMapRef] = useState(null);
  useEffect(() => {
    if (
      location &&
      Object.keys(location) &&
      Object.keys(location)?.length > 0
    ) {
      setCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location]);
  console.log("Center", center);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const mapLoadHandler = (map) => {
    setMapRef(map);
  };

  const onPlaceChangedHandler = () => {
    if (autocomplete !== null) {
      setCenter({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
      setLocation({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
    }
  };

  const autocompleteLoadHandler = (autocomplete) => {
    setAutocomplete(autocomplete);
  };
  //form initialization and validation
  const form = useForm({
    initialValues: {
      name: "",
      _geo: {
        lat: "",
        lng: "",
      },
      location: "",
      regionId: "", // Provide the default region ID here
      specific_area: "",
    },
  });
  const [regionsDropDownData, setRegionsDropDownData] = useState([]);
  const [regions, setRegions] = useState([]);
  const [areasDropDownData, setAreasDropDownData] = useState([]);

  // graphql queries
  const { loading: regionsLoading } = useQuery(GET_REGIONS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let regions = data.regions;
      let regionsArray = [];

      // loop over regions data to structure the data for the use of drop down
      regions.data.forEach((region, index) => {
        regionsArray.push({
          label: region?.name,
          value: region?.id,
        });
      });

      // put it on the state
      setRegionsDropDownData([...regionsArray]);
      setRegions(regions.data);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  const [createWarehouse, { loading }] = useMutation(CREATE_WARE_HOUSE, {
    update(cache, { data: { createWarehouse } }) {
      cache.updateQuery(
        {
          query: GET_WARE_HOUSES,
          variables: {
            first: parseInt(10),
            page: activePage,
            search: "",
          },
        },
        (data) => {
          return {
            warehouses: {
              ...data.warehouses,
              data: [createWarehouse, ...data.warehouses.data],
            },
          };
        }
      );
    },
  });

  const submit = () => {
    createWarehouse({
      variables: {
        name: form.getInputProps("name").value,
        regionId: form.getInputProps("regionId").value, // Provide the regionId variable
        _geo: {
          lat: +location.lat,
          lng: +location.lng,
        },
        specific_area: form.getInputProps("specific_area").value,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Warehouse Created Successfully",
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
  const setRegionDropDownValue = (val) => {
    form.setFieldValue("regionId", val);
    const region = regions.find((item) => item.id === val);
    const parsedSpecificAreas = JSON.parse(region.specific_areas);
    setAreasDropDownData(parsedSpecificAreas);
  };
  const setAreasDropDownValue = (val) => {
    //
    form.setFieldValue("specific_area", val);
    form.setFieldValue("location", val);
  };
  return (
    <>
      <LoadingOverlay
        visible={loading || regionsLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.6 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Name"
                placeholder="Name"
                {...form.getInputProps("name")}
              />
              {isLoaded && (
                <Autocomplete
                  onLoad={autocompleteLoadHandler}
                  onPlaceChanged={onPlaceChangedHandler}
                >
                  <TextInput
                    required
                    label="Location"
                    placeholder="Location"
                    {...form.getInputProps("location")}
                  />
                </Autocomplete>
              )}
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                required
                searchable
                data={regionsDropDownData}
                value={form.getInputProps("regionId")?.value}
                onChange={setRegionDropDownValue}
                label="Region"
                placeholder="Pick a region this Warehouse belongs to"
              />
              <Select
                required
                data={areasDropDownData}
                value={form.getInputProps("specific_area")?.value}
                onChange={setAreasDropDownValue}
                label="Specific Area"
                placeholder="Pick a Specific Area this Warehouse belongs to"
              />
            </Grid.Col>
          </Grid>
          <Grid style={{ marginTop: "10px" }}>
            <Grid.Col span={12}>
              <ScrollArea style={{ height: "auto" }}>
                {isLoaded ? (
                  <GoogleMap
                    center={center}
                    zoom={14}
                    mapContainerStyle={containerStyle}
                    onLoad={mapLoadHandler}
                    onClick={() =>
                      mapRef && setCenter(mapRef.getCenter().toJSON())
                    }
                  >
                    <MarkerF
                      position={center}
                      draggable
                      onDragEnd={(a) => setLocation(a.latLng.toJSON())}
                    />
                  </GoogleMap>
                ) : (
                  <Loader />
                )}
              </ScrollArea>
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
        </form>
      </ScrollArea>
    </>
  );
}
