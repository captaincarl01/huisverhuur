import { CITIES } from "../data/properties";

export default function CityPills({ activeCity, onChange }) {
  return (
    <div className="cities">
      {CITIES.map(c => (
        <div
          key={c.value}
          className={`city-pill${activeCity === c.value ? " active" : ""}`}
          onClick={() => onChange(c.value)}
        >
          {c.flag} {c.label}
        </div>
      ))}
    </div>
  );
}