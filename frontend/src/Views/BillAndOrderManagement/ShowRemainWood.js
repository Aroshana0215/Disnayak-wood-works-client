import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Divider,
  Chip,
  CircularProgress,
  TextField,
  Tooltip,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSelector } from "react-redux";

import { getCategoryById } from "../../services/PriceCardService";
import {
  createStockSummary,
  getActiveStockSummaryDetails,
} from "../../services/InventoryManagementService/StockSummaryManagementService";

const ShowRemainWood = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payloadBulk } = location.state || { payloadBulk: [] };

  const [woodData, setWoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ right side editor selection
  const [selectedId, setSelectedId] = useState(null);

  const { user } = useSelector((state) => state.auth);

  const currentDate = useMemo(() => new Date(), []);
  const formattedDate = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const woodDetails = await Promise.all(
          (payloadBulk || []).map(async (payload, idx) => {
            const categoryData = await getCategoryById(payload.categoryId);
            if (!categoryData) return null;

            const data = await getActiveStockSummaryDetails(
              categoryData.categoryId,
              payload.length
            );

            let toBeCut = 0;
            if (!data) {
              toBeCut = 0 - Number(payload.amount || 0);
            } else {
              toBeCut =
                Number(data?.totalPieces || 0) > Number(payload.amount || 0)
                  ? 0
                  : Number(payload.amount || 0) - Number(data?.totalPieces || 0);
            }

            return {
              id: `${categoryData.categoryId}-${payload.length}-${idx}`, // ✅ stable id
              ...payload,

              timberType: categoryData.timberType,
              timberNature: categoryData.timberNature,

              length: categoryData.areaLength,
              width: categoryData.areaWidth,

              totalPieces: Number(data?.totalPieces || 0),
              unitPrice: categoryData.unitPrice,
              billPrice: categoryData.unitPrice, // default

              changedAmount: data?.changedAmount || 0,
              categoryId_fk: data?.categoryId_fk || categoryData.categoryId,
              previousAmount: data?.previousAmount || "0",
              stk_id_fk: data?.stk_id_fk || null,

              toBeCut: Math.abs(Number(toBeCut || 0)),
              summaryId: data?.id || null,

              requestLength: payload.length,
            };
          })
        );

        const cleaned = woodDetails.filter(Boolean);

        if (mounted) {
          setWoodData(cleaned);
          // ✅ auto select first row for easy editing
          setSelectedId(cleaned?.[0]?.id || null);
        }
      } catch (e) {
        console.error("Error loading remain wood:", e?.message || e);
        if (mounted) {
          setWoodData([]);
          setSelectedId(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [payloadBulk]);

  // ✅ Update bill price from editor
  const updateBillPrice = (id, value) => {
    setWoodData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, billPrice: value } : r))
    );
  };

  const selectedItem = useMemo(
    () => woodData.find((x) => x.id === selectedId) || null,
    [woodData, selectedId]
  );

  const columns = useMemo(
    () => [
      {
        field: "rowNo",
        headerName: "#",
        width: 10,
        sortable: false,
        valueGetter: (_v, row) => row?.rowNo,
      },
      {
        field: "categoryId",
        headerName: "Category",
        width: 100,
        renderCell: (params) => (
          <Chip size="small" label={params.value || "—"} variant="outlined" />
        ),
      },
      { field: "timberType", headerName: "Type", width: 100 },
      {
        field: "dimension",
        headerName: "Dimensions",
        width: 100,
        sortable: false,
        renderCell: (params) =>
          `${params.row?.length ?? 0} x ${params.row?.width ?? 0}`,
      },
      { field: "requestLength", headerName: "Length", width: 100 },
      { field: "amount", headerName: "Amount", width: 100 },
      { field: "totalPieces", headerName: "Stock", width: 80 },
      {
        field: "toBeCut",
        headerName: "Status",
        width: 120,
        sortable: false,
        renderCell: (params) => {
          const cut = Number(params.row?.toBeCut || 0);
          if (cut > 0) return <Chip size="small" color="warning" label={`To Be Cut: ${cut}`} />;
          return <Chip size="small" color="success" label="In Stock" variant="outlined" />;
        },
      },
      { field: "unitPrice", headerName: "Unit Price", width: 100 },
    ],
    []
  );

  const gridRows = useMemo(
    () => woodData.map((r, i) => ({ ...r, rowNo: i + 1 })),
    [woodData]
  );

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const updatedWoodData = await Promise.all(
        woodData.map(async (payload) => {
          const categoryData = await getCategoryById(payload.categoryId);
          const data = await getActiveStockSummaryDetails(
            categoryData.categoryId,
            payload.requestLength
          );

          let updatedPayload = { ...payload };

          // create stock summary if missing
          if (!data) {
            const stockSumData = {
              totalPieces: "0",
              changedAmount: "0",
              previousAmount: "0",
              toBeCutAmount: 0,
              categoryId_fk: categoryData.categoryId,
              maxlength: categoryData.maxlength,
              minlength: categoryData.minlength,
              timberNature: categoryData.timberNature,
              timberType: categoryData.timberType,
              areaLength: categoryData.areaLength,
              areaWidth: categoryData.areaWidth,
              stk_id_fk: null,
              length: String(payload.requestLength), // ✅ string required
              status: "A",
              billId_fk: "",
              createdBy: user?.displayName || "",
              createdDate: formattedDate,
            };

            const stockSummaryId = await createStockSummary(stockSumData);
            updatedPayload.summaryId = stockSummaryId;
          }

          // fallback billPrice
          if (
            updatedPayload.billPrice === null ||
            updatedPayload.billPrice === undefined ||
            updatedPayload.billPrice === ""
          ) {
            updatedPayload.billPrice = updatedPayload.unitPrice;
          }

          return updatedPayload;
        })
      );

      setWoodData(updatedWoodData);
      navigate("/bill/add", { state: { woodData: updatedWoodData } });
    } catch (e) {
      console.error("Submit error:", e?.message || e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 900, letterSpacing: 0.2, color: "#9C6B3D" }}
            >
              Update Category Prices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a row, then update Bill Price from the right panel.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={loading ? "Loading..." : `${woodData.length} item(s)`}
              variant="outlined"
            />
            <Tooltip title="Bill Price is edited from the right panel">
              <Chip size="small" label="Bill Price Editor" color="warning" variant="outlined" />
            </Tooltip>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress size={26} />
              <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
                Loading wood details...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* LEFT: TABLE */}
              <Grid item xs={12} md={8.5}>
                <Box sx={{ height: "70vh", width: "100%" }}>
                  <DataGrid
                    rows={gridRows}
                    columns={columns}
                    disableRowSelectionOnClick
                    hideFooterPagination
                    hideFooterSelectedRowCount
                    hideFooterRowCount
                    rowHeight={52}
                    onRowClick={(params) => setSelectedId(params.row.id)}
                    getRowClassName={(params) =>
                      params.row.id === selectedId ? "row-selected" : ""
                    }
                    sx={{
                      border: 0,
                      "& .MuiDataGrid-columnHeaders": {
                        bgcolor: "rgba(0,0,0,0.02)",
                        borderBottom: "1px solid rgba(0,0,0,0.08)",
                      },
                      "& .MuiDataGrid-cell": {
                        outline: "none !important",
                      },
                      "& .row-selected": {
                        bgcolor: "rgba(156,107,61,0.08) !important",
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* RIGHT: BILL PRICE EDITOR */}
              <Grid item xs={12} md={3.5}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    position: "sticky",
                    top: 16,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                    Bill Price Editor
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Click a row in the table to edit its Bill Price.
                  </Typography>

                  {!selectedItem ? (
                    <Typography variant="body2" color="text.secondary">
                      Select a row to begin.
                    </Typography>
                  ) : (
                    <>
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                        <Chip size="small" label={selectedItem.categoryId} variant="outlined" />
                        {Number(selectedItem.toBeCut) > 0 ? (
                          <Chip
                            size="small"
                            color="warning"
                            label={`To Be Cut: ${selectedItem.toBeCut}`}
                          />
                        ) : (
                          <Chip size="small" color="success" label="In Stock" variant="outlined" />
                        )}
                      </Stack>

                      <Divider sx={{ mb: 2 }} />

                      <Stack spacing={1.2}>
                        <TextField
                          label="Type"
                          value={selectedItem.timberType || ""}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Dimensions"
                          value={`${selectedItem.length} x ${selectedItem.width}`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Length"
                          value={selectedItem.requestLength || ""}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Unit Price"
                          value={selectedItem.unitPrice || ""}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />

                        {/* ✅ MAIN EDIT FIELD */}
                        <TextField
                          label="Bill Price (Editable)"
                          value={selectedItem.billPrice ?? ""}
                          size="medium"
                          disabled={isSubmitting}
                          onChange={(e) => updateBillPrice(selectedItem.id, e.target.value)}
                          inputProps={{ inputMode: "decimal" }}
                          sx={{
                            mt: 0.5,
                            "& .MuiInputBase-root": {
                              bgcolor: "rgba(156,107,61,0.10)",
                              fontWeight: 900,
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(156,107,61,0.55) !important",
                            },
                          }}
                          helperText="This is the only editable value on this page."
                        />
                      </Stack>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        <Divider />

        {/* Footer actions */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            bgcolor: "background.paper",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || loading || woodData.length === 0}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ShowRemainWood;