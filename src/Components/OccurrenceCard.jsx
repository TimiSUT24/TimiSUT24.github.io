export default function OccurrenceCard({ item, onBook }) {
  const start = new Date(item.startUtc);
  const end = new Date(item.endUtc);
  const pad2 = (n) => String(n).padStart(2, "0");

  const y = start.getFullYear();
  const m = pad2(start.getMonth() + 1);
  const d = pad2(start.getDate());
  const dateStr = `${y}-${m}-${d}`;

  const timeStr = `${pad2(start.getHours())}:${pad2(start.getMinutes())}-${pad2(
    end.getHours()
  )}:${pad2(end.getMinutes())}`;

  const durationMin = Math.max(0, Math.round((end - start) / 60000));
  // För uträkning av platser
  const cap = item.effectiveCapacity ?? item.capacity ?? 0;
  const booked = item.bookedPeople ?? 0;
  // Om availableCapacity finns används den, annars räknas det ut
  // baserat på kapacitet minus bokade platser
  const remaining = item.availableCapacity ?? Math.max(0, cap - booked);
  const full = remaining <= 0;

  const isOutdoor = item.environment === 1;

  const title = item.activityName ?? item.activity ?? item.name ?? "Activity";
  const place = item.placeName ?? item.place ?? "Okänd plats";
  const description =
    item.raw?.activityDescription ?? item.activityDescription ?? "";
  const category =
    item.categoryName ??
    item.category ??
    item.activityCategory ??
    "Okänd kategori";

  return (
    <article className="occurrence-card brick-frame mario-card">
      <header className="occurrence-card-header mario-card__header">
        <div className="mario-card__titlewrap">
          <h3 className="occurrence-card-title mario-title">
            <img
              src={
                isOutdoor
                  ? "/IMG/icons8-pixel-star-48.png"
                  : "/IMG/Mario-Mushroom-Step-10.webp"
              }
              alt=""
              width={18}
              height={18}
              className="mario-icon"
            />
            {title}
          </h3>
          {category && (
            <div className="mario-card__meta">
              <span className="mario-chip mario-chip--category">
                Kategori: {category}
              </span>
            </div>
          )}
        </div>

        <span
          className={`mario-badge ${
            isOutdoor ? "mario-badge--out" : "mario-badge--in"
          }`}
        >
          {isOutdoor ? "UTOMHUS" : "INOMHUS"}
        </span>
      </header>

      <div className="mario-row">
        <span className="mario-label">Var:</span>
        <span className="mario-value one-line" title={place}>
          {place}
        </span>
      </div>

      <div className="mario-row">
        <span className="mario-label">Vad:</span>
        <span className="mario-value one-line" title={description}>
          {description}
        </span>
      </div>

      <div className="mario-row">
        <span className="mario-label">Tid:</span>
        <span className="mario-value">
          {dateStr}
          <br />
          {timeStr}
        </span>
      </div>

      <div className="mario-row">
        <span className="mario-label">Passlängd:</span>
        <span className="mario-value">
          <span style={{ fontSize: ".82rem" }}>{durationMin} min</span>
        </span>
      </div>

      <div className="mario-row">
        <span className="mario-label">Platser:</span>
        <span
          className={`mario-value ${
            full ? "mario-value--danger" : "mario-value--ok"
          }`}
        >
          {full ? "🔴 Fullt" : `🟢 ${remaining} kvar`}
        </span>
      </div>

      {isOutdoor && item.weatherForecast && (
        <div className="occurrence-weather mario-weather">
          <span>
            <span className="wx">🌡</span> {item.weatherForecast.temperatureC}°C
          </span>
          <span>
            <span className="wx">💨</span> {item.weatherForecast.windSpeedMs}{" "}
            m/s
          </span>
          <span>
            <span className="wx">☔</span> {item.weatherForecast.rainVolumeMm}{" "}
            mm
          </span>
        </div>
      )}

      <button
        className={`m-btn ${
          full ? "m-btn--disabled" : "m-btn--primary"
        } mario-book`}
        onClick={() => onBook?.(item.id)}
        disabled={full}
      >
        {full ? "Fullt" : "Boka"}
      </button>
    </article>
  );
}
