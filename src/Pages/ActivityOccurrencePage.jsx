import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import OccurrenceCard from "../Components/OccurrenceCard";
import BookingModal from "../Components/BookingModal";
import "../CSS/Occurrences.css";
import { parseApiError } from "../lib/parseApiError";

export default function ActivityOccurrencePage() {
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [places, setPlaces] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categoryId: "",
    activityId: "",
    placeId: "",
    environment: "", // "" | "0" | "1"
    onlyAvailable: false,
    minAvailable: "",
    freeTextSearch: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  //Pagination
  const pagedData = useMemo(() => {
    const start = (page - 1 ) * pageSize;
    const end = start + pageSize;
    return data.slice(start,end);
  },[data, page])

  useEffect(() => {
    setPage(1);

  }, [filters, data]);

  // Dropdown-data

  useEffect(() => {
    (async () => {
      const tryGet = async (paths) => {
        for (const p of paths) {
          try {
            const r = await api.get(p);
            console.log(
              "OK:",
              p,
              Array.isArray(r?.data) ? r.data.length : r?.data
            );
            return r?.data;
          } catch (e) {
            console.warn("GET fail:", p, e?.response?.status, e?.message);
          }
        }
        return null;
      };
      const toArray = (x) => (Array.isArray(x) ? x : x?.items ?? []);

      const catsRaw = await tryGet(["/api/Category"]);
      const plsRaw = await tryGet(["/api/Place"]);
      const actsRaw = await tryGet(["/api/Activity"]);

      const cats = toArray(catsRaw);
      const pls = toArray(plsRaw);
      const acts = toArray(actsRaw);

      setCategories(cats);
      setAllPlaces(pls);
      setPlaces(pls);
      setActivities(acts);
    })();
  }, []);

  useEffect(() => {
    async function fetchAllowedPlaces() {
      if (!filters.activityId) {
        setPlaces(allPlaces); // no activity selected, show all
        return;
      }

      try {
        const res = await api.get(`/api/ActivityPlace/${filters.activityId}/places`);
        setPlaces(res.data || []);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.detail || e.message);
      }
    }

    fetchAllowedPlaces();
  }, [filters.activityId])

  // Bygg querystring (matchar OccurencyQuery)
  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    // Datum: om startDate saknas, sätt till nästa halvtimme (lokalt)
    const nextHalfHourLocal = (() => {
      const d = new Date();
      d.setSeconds(0, 0);
      const add = 30 - (d.getMinutes() % 30 || 30);
      d.setMinutes(d.getMinutes() + add);
      return d;
    })();

    if (filters.startDate) {
      p.set(
        "fromDate",
        new Date(`${filters.startDate}T00:00:00Z`).toISOString()
      );
    } else {
      p.set("fromDate", nextHalfHourLocal.toISOString());
    }
    if (filters.endDate) {
      p.set("toDate", new Date(`${filters.endDate}T23:59:59Z`).toISOString());
    } else {
      // Om inget slutdatum är satt, sätt till 30 dagar framåt från startdatum
      const to = new Date(
        new Date(p.get("fromDate")).getTime() + 30 * 24 * 60 * 60 * 1000
      );
      p.set("toDate", to.toISOString());
    }

    if (filters.categoryId) p.set("categoryId", filters.categoryId);
    if (filters.activityId) p.set("activityId", filters.activityId);
    if (filters.placeId) p.set("placeId", filters.placeId);
    if (filters.environment !== "") p.set("environment", filters.environment);
    if (filters.onlyAvailable) p.set("onlyAvailable", "true");
    if (filters.minAvailable !== "" && Number(filters.minAvailable) >= 0)
      p.set("minAvailable", String(Number(filters.minAvailable)));
    // Fritextssökning (minst 2 tecken)
    const q = (filters.freeTextSearch ?? "").trim();
    if (q.length >= 2) p.set("freeTextSearch", q);
    return p.toString();
  }, [filters]);

  async function fetchOccurrences() {
    setLoading(true);
    setErr("");
    try {
      const url = `/api/ActivityOccurrence/with-weather${
        queryString ? `?${queryString}` : ""
      }`;
      console.log("GET:", url); // DEBUG
      const res = await api.get(url);
      const payload = res?.data;
      const items = Array.isArray(payload) ? payload : payload?.items ?? [];
      const flat = items.map((x) => (x.raw ? { ...x, ...x.raw } : x));
      console.log("RESULT count:", items.length); // DEBUG
      setData(flat);
    } catch {
      setErr("Kunde inte hämta tillfällen");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOccurrences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFilters((f) => ({ ...f, [k]: v }));
  };

  const resetFilters = () =>
    setFilters({
      startDate: "",
      endDate: "",
      categoryId: "",
      activityId: "",
      placeId: "",
      environment: "",
      onlyAvailable: false,
      minAvailable: "",
      freeTextSearch: "",
    });

  // Booking-modal
  const handleBook = (id) => {
    setSelectedId(id);
    setModalOpen(true);
  };
  const handleClose = () => {
    setModalOpen(false);
    setSelectedId(null);
  };
  const handleConfirm = async (people) => {
    try {
      setLoading(true);
      const res = await api.post("/api/Booking", {
        ActivityOccurrenceId: selectedId,
        peopleCount: people,
      });
      await fetchOccurrences();
      return { ok: true, data: res?.data };
    } catch (e) {
      const { message, list } = parseApiError(e);
      return { ok: false, error: message, errors: list };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="occurrence-page">
      <h1 className="occurrence-title mario-page-title">
        <img
          src="/IMG/icons8-pixel-star-48.png"
          alt=""
          width={22}
          height={22}
          className="m-icon"
        />
        Sök aktivitetstillfällen
      </h1>

      <section className="occurence-filters brick-frame brick-filters">
        <div className="occurence-field">
          <label>Fritext</label>
          <input
            type="text"
            value={filters.freeTextSearch}
            onChange={onChange("freeTextSearch")}
          />
        </div>

        <div className="occurence-field">
          <label>Från datum</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={onChange("startDate")}
          />
        </div>

        <div className="occurence-field">
          <label>Till datum</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={onChange("endDate")}
          />
        </div>

        <div className="occurence-field">
          <label>Kategori</label>
          <select value={filters.categoryId} onChange={onChange("categoryId")}>
            <option value="">Alla</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="occurence-field">
          <label>Aktivitet</label>
          <select value={filters.activityId} onChange={onChange("activityId")}>
            <option value="">Alla</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="occurence-field">
          <label>Plats</label>
          <select value={filters.placeId} onChange={onChange("placeId")}>
            <option value="">Alla</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="occurence-field">
          <label>Inne/Ute</label>
          <select
            value={filters.environment}
            onChange={onChange("environment")}
          >
            <option value="">Båda</option>
            <option value="0">Inomhus</option>
            <option value="1">Utomhus</option>
          </select>
        </div>

        <div className="occurence-field">
          <label>Min. lediga platser</label>
          <input
            type="number"
            min={0}
            value={filters.minAvailable}
            onChange={onChange("minAvailable")}
          />
        </div>

        <div className="occurence-field">
          <label className="m-check">
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={onChange("onlyAvailable")}
            />
            <span>Endast lediga</span>
          </label>
        </div>

        <div className="occurence-field" style={{ alignSelf: "end" }}>
          <button className="occurrence-button" onClick={fetchOccurrences}>
            Sök
          </button>
        </div>
        <div className="occurence-field" style={{ alignSelf: "end" }}>
          <button className="occurrence-button-ghost" onClick={resetFilters}>
            Rensa
          </button>
        </div>
      </section>

      {err && (
        <div className="mario-alert mario-alert--error">
          <img
            src="/IMG/Mario-Mushroom-Step-10.webp"
            alt=""
            width={18}
            height={18}
            className="mario-icon"
          />
          <span>{err}</span>
        </div>
      )}

      {loading && <div className="occurrence-status">Laddar…</div>}

      {!loading && !err && data.length > 0 && (
        <div className="occurrence-meta mario-meta">       
          <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent:"center", alignItems:"center"}} className="pagination">
            <img
            src="/IMG/Mario-Mushroom-Step-10.webp"
            alt=""
            width={16}
            height={16}
            className="mario-icon"                    
            />
            <span>Antal:</span>
            <strong>{data.length}</strong>  
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{borderRadius:"10px", borderColor:"#ffd166", color:"white", backgroundColor:"#0b1b36"}}>⬅ Föregående</button>
            <span>Sida {page}</span>
            <button
              disabled={page * pageSize >= data.length}
              onClick={() => setPage(p => p + 1)}
              style={{borderRadius:"10px", borderColor:"#ffd166", color:"white", backgroundColor:"#0b1b36"}}
              >
              Nästa ➡
            </button>
          </div>
          </div>          
      )}
      <style>
            {`
              @media (max-width: 465px) {
            .pagination {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .mario-meta{
              justify-self: center !important;
          }
        }
      `}</style>
      {!loading && !err && (
        <div className="occurence-grid">
          {pagedData.map((o) => (
            <OccurrenceCard
              key={o.id}
              item={o}
              onBook={() => handleBook(o.id)}
            />
          ))}
        </div>
      )}
      <BookingModal
        open={modalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
