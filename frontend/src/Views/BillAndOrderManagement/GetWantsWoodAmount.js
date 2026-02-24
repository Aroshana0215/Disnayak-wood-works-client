import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  Paper,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import EditIcon from "@mui/icons-material/Edit";

import { useNavigate } from "react-router-dom";
import { getAllActiveTreeType } from "../../services/SettingManagementService/TreeTypeService";
import { getAllActiveTimberNature } from "../../services/SettingManagementService/TimberNatureService";
import { getAllCategoriesByTypeNature } from "../../services/PriceCardService";
import { toast } from "react-toastify"; // Import react-toastify

const emptyRow = {
  treeTypeId: "",
  typeName: "",
  timberNatureId: "",
  natureName: "",
  categoryId: "",
  minLength: "",
  maxLength: "",
  length: 0,
  amount: "",
};

const GetWantsWood = () => {
  // ✅ current input row (like CubicCalculate input fields)
  const [current, setCurrent] = useState({ ...emptyRow });

  // ✅ list (like rows in CubicCalculate table)
  const [rows, setRows] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [treeTypes, setTreeTypes] = useState([]);
  const [timberNatures, setTimberNatures] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [noCategories, setNoCategories] = useState(false);

  // ✅ cache by `${typeName}__${natureName}`
  const [categoryCache, setCategoryCache] = useState({});

  // ✅ right panel
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [treeTypeData, timberNatureData] = await Promise.all([
          getAllActiveTreeType(),
          getAllActiveTimberNature(),
        ]);

        setTreeTypes(Array.isArray(treeTypeData) ? treeTypeData : []);
        setTimberNatures(Array.isArray(timberNatureData) ? timberNatureData : []);
      } catch (e) {
        console.error("Error fetching dropdown data:", e);
      }
    };

    fetchDropdowns();
  }, []);

  const fetchCategories = async (typeName, natureName) => {
    const key = `${typeName}__${natureName}`;

    if (Object.prototype.hasOwnProperty.call(categoryCache, key)) {
      const cached = categoryCache[key] || [];
      setCategories(cached);
      setNoCategories(cached.length === 0);
      return;
    }

    setLoadingCategories(true);
    setNoCategories(false);
    setCategories([]);

    try {
      const res = await getAllCategoriesByTypeNature(typeName, natureName);
      const cats = Array.isArray(res) ? res : [];
      setCategories(cats);
      setCategoryCache((prev) => ({ ...prev, [key]: cats }));
      setNoCategories(cats.length === 0);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
      setNoCategories(true);
    } finally {
      setLoadingCategories(false);
    }
  };

  const buildLengthOptions = (min, max) => {
    const minN = Number(min);
    const maxN = Number(max);
    if (!Number.isFinite(minN) || !Number.isFinite(maxN) || minN > maxN) return [];
    const arr = [];
    for (let i = minN; i <= maxN; i += 1) arr.push(i);
    return arr;
  };

  const lengthOptions = useMemo(
    () => buildLengthOptions(current.minLength, current.maxLength),
    [current.minLength, current.maxLength]
  );

  const canPickCategory =
    Boolean(current.typeName) &&
    Boolean(current.natureName) &&
    !loadingCategories &&
    !noCategories;

  const canPickLength =
    canPickCategory && Boolean(current.categoryId) && lengthOptions.length > 0;

  const canPickAmount = canPickLength;

  const handleTreeTypeChange = async (e) => {
    const treeTypeId = e.target.value;
    const selected = treeTypes.find((t) => (t.treeTypeId ?? t.id) === treeTypeId);
    const typeName = selected?.typeName ?? "";

    const next = {
      ...current,
      treeTypeId,
      typeName,
      categoryId: "",
      minLength: "",
      maxLength: "",
      length: "",
      amount: "",
    };
    setCurrent(next);

    // clear right panel if changing
    setSelectedCategoryDetails(null);

    // if both selected -> fetch categories
    if (typeName && next.natureName) {
      await fetchCategories(typeName, next.natureName);
    } else {
      setCategories([]);
      setNoCategories(false);
    }
  };

  const handleTimberNatureChange = async (e) => {
    const timberNatureId = e.target.value;
    const selected = timberNatures.find((n) => (n.timberNatureId ?? n.id) === timberNatureId);
    const natureName = selected?.natureName ?? "";

    const next = {
      ...current,
      timberNatureId,
      natureName,
      categoryId: "",
      minLength: "",
      maxLength: "",
      length: "",
      amount: "",
    };
    setCurrent(next);

    setSelectedCategoryDetails(null);

    if (next.typeName && natureName) {
      await fetchCategories(next.typeName, natureName);
    } else {
      setCategories([]);
      setNoCategories(false);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCat = (categories || []).find((c) => (c.categoryId ?? c.id) === categoryId);

    const minLength = selectedCat?.minlength ?? "";
    const maxLength = selectedCat?.maxlength ?? "";

    setCurrent((prev) => ({
      ...prev,
      categoryId,
      minLength,
      maxLength,
      length: "",
      amount: "",
    }));

    setSelectedCategoryDetails(selectedCat || null);
  };

  const handleNormalChange = (e) => {
    const { name, value } = e.target;
    setCurrent((prev) => ({ ...prev, [name]: value }));
  };

  const clearCurrent = () => {
    setCurrent({ ...emptyRow });
    setCategories([]);
    setNoCategories(false);
    setLoadingCategories(false);
    setSelectedCategoryDetails(null);
    setEditIndex(null);
  };

  const handleAddOrUpdate = () => {
    // basic validation
    if (!current.treeTypeId || !current.timberNatureId || !current.categoryId || !current.amount) {
      alert("Please select Tree Type, Timber Nature, Category, Length, and Amount.");
      return;
    }

    // Check if the same categoryId with the same length is already in rows
    const duplicate = rows.some(
      (row) => row.categoryId === current.categoryId && row.length === current.length
    );

    if (duplicate) {
      toast.warning("Cannot add this category again. It is already in the added list.");
      return;
    }

    // if editing -> update row
    if (editIndex !== null) {
      const updated = [...rows];
      updated[editIndex] = { ...current };
      setRows(updated);
      clearCurrent();
      return;
    }

    // add new
    setRows((prev) => [...prev, { ...current }]);
    clearCurrent();
  };

  const handleEditRow = async (index) => {
    const row = rows[index];
    setEditIndex(index);
    setCurrent({ ...row });

    // load categories for that row (so category dropdown is correct)
    if (row.typeName && row.natureName) {
      await fetchCategories(row.typeName, row.natureName);
    }

    // set right panel details
    // try to find details from loaded categories cache; fallback to null
    const key = `${row.typeName}__${row.natureName}`;
    const cats = categoryCache[key] || categories || [];
    const selectedCat = cats.find((c) => (c.categoryId ?? c.id) === row.categoryId);
    setSelectedCategoryDetails(selectedCat || null);
  };

  const handleDeleteRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) {
      clearCurrent();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // pass list like before
    navigate("/bill/show-remain-wood", { state: { payloadBulk: rows } });
  };

  const DetailRow = ({ label, value }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.6 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right" }}>
        {value ?? "-"}
      </Typography>
    </Box>
  );

  return (
    <Grid container spacing={1}>
      {/* LEFT SIDE */}
      <Grid item xs={12} md={9.5}>
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
                Create Bill
              </Typography>

              <Button type="submit" variant="contained" disabled={rows.length === 0}>
                Create
              </Button>
            </Stack>

            {/* INPUT ROW (like CubicCalculate) */}
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth>
                  <FormLabel>Tree Type</FormLabel>
                  <Select
                    size="small"
                    value={current.treeTypeId}
                    onChange={handleTreeTypeChange}
                    fullWidth
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    {treeTypes.map((t) => (
                      <MenuItem key={t.treeTypeId ?? t.id} value={t.treeTypeId ?? t.id}>
                        {t.typeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth>
                  <FormLabel>Timber Nature</FormLabel>
                  <Select
                    size="small"
                    value={current.timberNatureId}
                    onChange={handleTimberNatureChange}
                    fullWidth
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    {timberNatures.map((n) => (
                      <MenuItem key={n.timberNatureId ?? n.id} value={n.timberNatureId ?? n.id}>
                        {n.natureName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth>
                  <FormLabel>Category ID</FormLabel>
                  <Select
                    size="small"
                    value={current.categoryId}
                    onChange={handleCategoryChange}
                    fullWidth
                    disabled={!canPickCategory}
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    {loadingCategories ? (
                      <MenuItem disabled value="">
                        <CircularProgress size={16} style={{ marginRight: 8 }} />
                        Loading...
                      </MenuItem>
                    ) : null}

                    {!loadingCategories && noCategories ? (
                      <MenuItem disabled value="">
                        No Category Found
                      </MenuItem>
                    ) : null}

                    {categories.map((c) => (
                      <MenuItem key={c.categoryId ?? c.id} value={c.categoryId ?? c.id}>
                        {c.categoryId ?? c.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth>
                  <FormLabel>
                    Length{" "}
                    {current.minLength && current.maxLength
                      ? `(${current.minLength} - ${current.maxLength})`
                      : ""}
                  </FormLabel>
                  <Select
                    size="small"
                    name="length"
                    value={current.length}
                    onChange={handleNormalChange}
                    fullWidth
                    disabled={!canPickLength}
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    {lengthOptions.map((len) => (
                      <MenuItem key={len} value={len}>
                        {len}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={1.9}>
                <FormControl fullWidth>
                  <FormLabel>Amount</FormLabel>
                  <Select
                    size="small"
                    name="amount"
                    value={current.amount}
                    onChange={handleNormalChange}
                    fullWidth
                    disabled={!canPickAmount}
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    {[...Array(101).keys()].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={0.5} sx={{ display: "flex", justifyContent: "center" }}>
                <IconButton
                  sx={{ color: "#9C6B3D" }}
                  onClick={handleAddOrUpdate}
                  disabled={!canPickAmount}
                  title={editIndex !== null ? "Update" : "Add"}
                >
                  <AddCircleOutlineOutlinedIcon />
                </IconButton>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* TABLE LIST (like CubicCalculate) */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tree Type</TableCell>
                    <TableCell>Nature</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Length</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography variant="body2" color="text.secondary">
                          No records added yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, idx) => (
                      <TableRow
                        key={idx}
                        hover
                        selected={editIndex === idx}
                        onClick={() => {
                          // clicking row updates right panel too
                          const key = `${r.typeName}__${r.natureName}`;
                          const cats = categoryCache[key] || [];
                          const selectedCat = cats.find((c) => (c.categoryId ?? c.id) === r.categoryId);
                          setSelectedCategoryDetails(selectedCat || null);
                        }}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{r.typeName}</TableCell>
                        <TableCell>{r.natureName}</TableCell>
                        <TableCell>{r.categoryId}</TableCell>
                        <TableCell>{r.length}</TableCell>
                        <TableCell>{r.amount}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleEditRow(idx)} size="small">
                            <EditIcon color="primary" fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteRow(idx)} size="small">
                            <HighlightOffIcon color="error" fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </form>
      </Grid>

      {/* RIGHT SIDE: DETAILS PANEL */}
      <Grid item xs={12} md={2.5} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Paper
          sx={{
            width: "100%",
            maxWidth: 280, // ✅ reduced width
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            p: 2,
            position: "sticky",
            top: 16,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            Category Details
          </Typography>

          {selectedCategoryDetails ? (
            <>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                <Chip size="small" label={selectedCategoryDetails.categoryId ?? "—"} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={selectedCategoryDetails.description ?? "—"}
                />
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <DetailRow label="Timber Type" value={selectedCategoryDetails.timberType} />
              <DetailRow label="Timber Nature" value={selectedCategoryDetails.timberNature} />
              <DetailRow label="Area Width" value={selectedCategoryDetails.areaWidth} />
              <DetailRow label="Area Length" value={selectedCategoryDetails.areaLength} />
              <DetailRow label="Unit Price" value={selectedCategoryDetails.unitPrice} />
              <DetailRow label="Created By" value={selectedCategoryDetails.createdBy} />
              <DetailRow label="Created Date" value={selectedCategoryDetails.createdDate} />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a Category ID to view details here.
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default GetWantsWood;
