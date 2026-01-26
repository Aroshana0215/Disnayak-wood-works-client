import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  OutlinedInput,
  FormControl,
  Stack,
  Select,
  MenuItem,
} from "@mui/material";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createCategory,
  validateCategoryType,
  validateCategoryType2,
} from "../../services/PriceCardService";
import { getAllActiveTreeType } from "../../services/SettingManagementService/TreeTypeService";
import { getAllActiveTimberNature } from "../../services/SettingManagementService/TimberNatureService";

const CreateCategory = () => {
  const { user } = useSelector((state) => state.auth);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const day = ("0" + currentDate.getDate()).slice(-2);
  const formattedDate = `${year}-${month}-${day}`;

  const [isplank, setIsplank] = useState(false);
  const [isTimberDust, setIsTimberDust] = useState(false);
  const [isLumber, setisLumber] = useState(false);
  const [isWoodwork, setIsWoodwork] = useState(false); // ✅ NEW

  const [treeTypes, setTreeTypes] = useState([]);
  const [timberNature, setTimberNature] = useState([]);

  const [formData] = useState({
    timberType: { bpMD: 6 },
    timberNature: { bpMD: 6 },
    areaLength: { bpMD: 6 },
    areaWidth: { bpMD: 6 },
    minlength: { bpMD: 6 },
    maxlength: { bpMD: 6 },
    unitPrice: { bpMD: 6 },
    description: { bpMD: 6 },
  });

  const [payload, setPayload] = useState({
    timberType: "",
    timberNature: "",
    areaLength: 0,
    areaWidth: 0,
    minlength: 0,
    maxlength: 0,
    description: "",
    unitPrice: "",
    status: "A",
    createdBy: user?.displayName ?? "",
    createdDate: formattedDate,
  });

  const plankValues = [
    0.3, 0.4, 0.5, 0.6, 0.7, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2, 2.1,
    2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3,
  ];
  const defaultValues = Array.from({ length: 10 }, (_, i) => i + 1);

  const renderMenuItems = (values) =>
    values.map((value) => (
      <MenuItem key={value} value={value}>
        {value}
      </MenuItem>
    ));

  const menuItems = isplank
    ? renderMenuItems(plankValues)
    : renderMenuItems(defaultValues);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPayload((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "timberNature") {
        // ✅ flags
        setIsWoodwork(value === "Woodwork");

        if (value === "Planks") {
          setIsplank(true);
          setIsTimberDust(false);
          setisLumber(false);
        } else if (value === "Dust") {
          setIsplank(false);
          setIsTimberDust(true);
          setisLumber(false);
        } else {
          setIsplank(false);
          setIsTimberDust(false);
          setisLumber(true);
        }

        // ✅ When Woodwork -> set min/max to 0 (and UI will be disabled)
        if (value === "Woodwork") {
          next.minlength = 0;
          next.maxlength = 0;
        }
      }

      return next;
    });
  };

  useEffect(() => {
    const fetchTreeTypes = async () => {
      try {
        const response = await getAllActiveTreeType();
        setTreeTypes(Array.isArray(response) ? response : []);

        const response2 = await getAllActiveTimberNature();
        setTimberNature(Array.isArray(response2) ? response2 : []);
      } catch (error) {
        console.error("Error fetching tree types:", error);
        toast.error("Error fetching tree types.");
      }
    };

    fetchTreeTypes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = [
      { name: "timberType", label: "Timber Type" },
      { name: "timberNature", label: "Timber Nature" },
      { name: "areaLength", label: "Area Length" },
      { name: "areaWidth", label: "Area Width" },
      { name: "minlength", label: "Min Length" },
      { name: "maxlength", label: "Max Length" },
      { name: "unitPrice", label: "Unit Price" },
    ];

    for (const field of requiredFields) {
      // ✅ Dust: only require timberType, timberNature, unitPrice
      if (isTimberDust) {
        if (
          field.name === "timberType" ||
          field.name === "timberNature" ||
          field.name === "unitPrice"
        ) {
          if (!payload[field.name] || payload[field.name] === "") {
            toast.error(`${field.label} is required`);
            return;
          }
        }
      } else {
        // ✅ Woodwork: do NOT require min/max (they are 0)
        if (isWoodwork && (field.name === "minlength" || field.name === "maxlength")) {
          // skip
        } else {
          if (!payload[field.name] || payload[field.name] === "") {
            toast.error(`${field.label} is required`);
            return;
          }
        }
      }

      if (field.name === "unitPrice") {
        if (isNaN(payload.unitPrice) || Number(payload.unitPrice) <= 0) {
          toast.error(`${field.label} must be a valid numeric value greater than 0.00`);
          return;
        }
      }
    }

    try {
       if (!isWoodwork) {
        const categoryData = await validateCategoryType(payload);
        if (categoryData != null) {
          if (Array.isArray(categoryData)) {
            for (const category of categoryData) {
              if (
                (category.areaLength === payload.areaLength &&
                  category.areaWidth === payload.areaWidth) ||
                (category.areaLength === payload.areaWidth &&
                  category.areaWidth === payload.areaLength)
              ) {
                toast.error("Record already exists with the same length and width.");
                return;
              }
            }
          } else {
            throw new Error("Invalid data format received from API");
          }
        }
    }

      // ✅ Skip length overlap validation if Woodwork (min/max are 0)
      if (!isWoodwork) {
        const categoryData2 = await validateCategoryType2(payload);
        if (categoryData2 != null) {
          if (Array.isArray(categoryData2)) {
            for (const category of categoryData2) {
              if (
                category.minlength <= payload.minlength &&
                payload.minlength <= category.maxlength
              ) {
                toast.error("Already existing record entered for min length.");
                return;
              }

              if (
                category.minlength <= payload.maxlength &&
                payload.maxlength <= category.maxlength
              ) {
                toast.error("Already existing record entered for max length.");
                return;
              }
            }
          } else {
            throw new Error("Invalid data format received from API");
          }
        }
      }

      await createCategory(payload);
      toast.success("Category created successfully!");
      setTimeout(() => {
        window.location.href = `/price`;
      }, 1000);
    } catch (error) {
      console.error("Error creating category:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <>
      <ToastContainer />

      <Grid container direction="row" justifyContent="center" alignItems="stretch">
        <Grid item xs={12}>
          <Grid
            container
            component={"form"}
            onSubmit={handleSubmit}
            padding={2}
            sx={{ bgcolor: "background.default", borderRadius: 2 }}
          >
            <Grid item xs={12} padding={1}>
              <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                <Typography variant="h6" sx={{ color: "#9C6B3D" }} align="center">
                  Create Load Details
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6} padding={1}>
              <FormControl fullWidth>
                <Typography>Timber Type</Typography>
                <Select name="timberType" value={payload.timberType} onChange={handleChange}>
                  {treeTypes.map((type) => (
                    <MenuItem key={type.id ?? type.typeId} value={type.typeName}>
                      {type.typeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6} padding={1}>
              <FormControl fullWidth>
                <Typography>Timber Nature</Typography>
                <Select name="timberNature" value={payload.timberNature} onChange={handleChange}>
                  {timberNature.map((type) => (
                    <MenuItem key={type.id ?? type.natureId} value={type.natureName}>
                      {type.natureName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4} padding={1}>
              <FormControl fullWidth>
                <Typography>Area Length</Typography>
                <Select
                  name="areaLength"
                  value={payload.areaLength}
                  onChange={handleChange}
                  disabled={isTimberDust}
                >
                  {menuItems}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4} padding={1}>
              <FormControl fullWidth>
                <Typography>Area Width</Typography>
                <Select
                  name="areaWidth"
                  value={payload.areaWidth}
                  onChange={handleChange}
                  disabled={isTimberDust}
                >
                  {[...Array(15)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2} padding={1}>
              <FormControl fullWidth>
                <Typography>Min Length</Typography>
                <Select
                  name="minlength"
                  value={payload.minlength}
                  onChange={handleChange}
                  disabled={isTimberDust || isWoodwork} // ✅ disable only for Woodwork (and Dust)
                >
                  {[...Array(25)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2} padding={1}>
              <FormControl fullWidth>
                <Typography>Max Length</Typography>
                <Select
                  name="maxlength"
                  value={payload.maxlength}
                  onChange={handleChange}
                  disabled={isTimberDust || isWoodwork} // ✅ disable only for Woodwork (and Dust)
                >
                  {[...Array(25)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {Object.entries(formData).map(
              ([key, item]) =>
                key !== "timberType" &&
                key !== "timberNature" &&
                key !== "areaLength" &&
                key !== "areaWidth" &&
                key !== "minlength" &&
                key !== "maxlength" &&
                key !== "thickness" && (
                  <Grid item key={key} xs={12} md={item.bpMD} padding={1}>
                    <FormControl fullWidth>
                      <Typography>
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/([A-Z])/g, " $1")}
                      </Typography>
                      <OutlinedInput name={key} value={payload[key]} onChange={handleChange} />
                    </FormControl>
                  </Grid>
                )
            )}

            <Grid
              item
              xs={12}
              padding={2}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <Button type="submit" variant="contained">
                Create
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateCategory;
