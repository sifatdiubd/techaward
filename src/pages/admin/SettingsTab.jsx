import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function SettingsTab({
  settings,
  setSettings,
  onSave,
  isSuperAdmin,
}) {
  const parsed = settings.eventDateTime
    ? new Date(settings.eventDateTime)
    : undefined;
  const eventDate = parsed && !isNaN(parsed.getTime()) ? parsed : undefined;
  const handleDateSelect = (date) => {
    if (!date) {
      setSettings({
        ...settings,
        eventDateTime: "",
      });
      return;
    }
    const prev = settings.eventDateTime
      ? new Date(settings.eventDateTime)
      : null;
    if (prev && !isNaN(prev.getTime())) {
      date.setHours(prev.getHours(), prev.getMinutes());
    } else {
      date.setHours(15, 0);
    }
    setSettings({
      ...settings,
      eventDateTime: date.toISOString(),
      dateStr: format(date, "do MMMM, EEEE"),
    });
  };
  const handleTimeChange = (value) => {
    if (!settings.eventDateTime) {
      return;
    }
    const date = new Date(settings.eventDateTime);
    const [hours, minutes] = value.split(":").map(Number);
    date.setHours(hours || 0, minutes || 0);
    setSettings({
      ...settings,
      eventDateTime: date.toISOString(),
    });
  };
  const timeValue = eventDate ? format(eventDate, "HH:mm") : "";
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Event Settings</h2>
      <div className="glass p-6 rounded-xl border border-gray-800 space-y-5">
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">
            Event Date (powers homepage countdown)
          </label>
          <div className="flex gap-2 mt-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-black/50 border-amber-500/30 text-white hover:bg-amber-500/10 flex-1 justify-start"
                >
                  <i className="fas fa-calendar mr-2 text-amber-500" />
                  {eventDate ? format(eventDate, "PPP") : "Pick event date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-black border-amber-500/30"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={handleDateSelect}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="form-input w-32"
            />
            {settings.eventDateTime && (
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    eventDateTime: "",
                  })
                }
                className="bg-red-500/20 text-red-400 px-3 rounded-lg text-xs"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">
            If empty, the homepage countdown is hidden.
          </p>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">
            Date String (display)
          </label>
          <input
            value={settings.dateStr}
            onChange={(e) =>
              setSettings({
                ...settings,
                dateStr: e.target.value,
              })
            }
            className="form-input"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Auto-filled from picker, but you can override.
          </p>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">
            Time String
          </label>
          <input
            value={settings.timeStr}
            onChange={(e) =>
              setSettings({
                ...settings,
                timeStr: e.target.value,
              })
            }
            className="form-input"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">
            Venue
          </label>
          <input
            value={settings.venueStr}
            onChange={(e) =>
              setSettings({
                ...settings,
                venueStr: e.target.value,
              })
            }
            className="form-input"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">
            Apps Script URL (Email)
          </label>
          <input
            value={settings.appsScriptUrl || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                appsScriptUrl: e.target.value,
              })
            }
            className="form-input font-mono text-xs"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">
            Meta Pixel ID
          </label>
          <input
            value={settings.metaPixelId || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                metaPixelId: e.target.value,
              })
            }
            className="form-input font-mono text-xs"
            placeholder="e.g. 1234567890"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">
            Manual Meta Pixel Code
          </label>
          <textarea
            value={settings.metaPixelCode || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                metaPixelCode: e.target.value,
              })
            }
            rows={4}
            className="form-input font-mono text-xs"
            placeholder="Paste full <script>...</script> code here"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            If manual code is provided, it will override the Pixel ID.
          </p>
        </div>
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            disabled={!isSuperAdmin}
            checked={settings.nominationOpen}
            onChange={(e) =>
              setSettings({
                ...settings,
                nominationOpen: e.target.checked,
              })
            }
            className="accent-amber-500 w-5 h-5"
          />
          Nomination Open
        </label>
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            disabled={!isSuperAdmin}
            checked={settings.votingOpen !== false}
            onChange={(e) =>
              setSettings({
                ...settings,
                votingOpen: e.target.checked,
              })
            }
            className="accent-amber-500 w-5 h-5"
          />
          Global Voting Open
        </label>
        {isSuperAdmin && (
          <button
            onClick={onSave}
            className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition"
          >
            Save Settings
          </button>
        )}
      </div>
    </div>
  );
}
