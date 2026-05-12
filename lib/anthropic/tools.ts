import Anthropic from "@anthropic-ai/sdk";

export const agentTools: Anthropic.Tool[] = [
  // --- ZLECENIA ---
  {
    name: "create_job",
    description: "Tworzy nowe zlecenie. Używaj gdy użytkownik chce dodać zlecenie lub wizytę.",
    input_schema: {
      type: "object",
      properties: {
        title:            { type: "string", description: "Tytuł zlecenia" },
        customer_id:      { type: "string", description: "UUID klienta (opcjonalne)" },
        category_id:      { type: "string", description: "UUID kategorii usługi (opcjonalne)" },
        description:      { type: "string" },
        scheduled_at:     { type: "string", description: "ISO 8601 datetime np. 2025-05-12T10:00:00" },
        scheduled_end_at: { type: "string", description: "ISO 8601 datetime zakończenia" },
        address:          { type: "string" },
        revenue:          { type: "number", description: "Wartość zlecenia w PLN" },
        notes:            { type: "string" },
      },
      required: ["title"],
    },
  },
  {
    name: "update_job",
    description: "Aktualizuje istniejące zlecenie (status, cena, termin, notatki itp.).",
    input_schema: {
      type: "object",
      properties: {
        job_id:           { type: "string" },
        title:            { type: "string" },
        status:           { type: "string", enum: ["nowe","w_trakcie","zakonczone","oplacone"] },
        scheduled_at:     { type: "string" },
        scheduled_end_at: { type: "string" },
        revenue:          { type: "number" },
        description:      { type: "string" },
        notes:            { type: "string" },
        address:          { type: "string" },
        customer_id:      { type: "string" },
        category_id:      { type: "string" },
      },
      required: ["job_id"],
    },
  },
  {
    name: "list_jobs",
    description: "Pobiera listę zleceń. Filtruj po statusie, kliencie, datach lub adresie/miejscowości. Gdy użytkownik pyta o konkretną miejscowość lub adres, użyj parametru address.",
    input_schema: {
      type: "object",
      properties: {
        status:      { type: "string", enum: ["nowe","w_trakcie","zakonczone","oplacone"] },
        customer_id: { type: "string" },
        date_from:   { type: "string", description: "ISO date YYYY-MM-DD" },
        date_to:     { type: "string" },
        address:     { type: "string", description: "Szukaj po adresie lub miejscowości (np. 'Jeleśnia', 'Bielsko')" },
        limit:       { type: "number" },
      },
    },
  },
  {
    name: "get_job",
    description: "Pobiera szczegóły jednego zlecenia z kosztami.",
    input_schema: {
      type: "object",
      properties: { job_id: { type: "string" } },
      required: ["job_id"],
    },
  },
  {
    name: "delete_job",
    description: "Usuwa zlecenie. Używaj tylko po potwierdzeniu użytkownika.",
    input_schema: {
      type: "object",
      properties: { job_id: { type: "string" } },
      required: ["job_id"],
    },
  },

  // --- KLIENCI ---
  {
    name: "create_customer",
    description: "Dodaje nowego klienta do bazy.",
    input_schema: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        phone:     { type: "string" },
        email:     { type: "string" },
        address:   { type: "string" },
        city:      { type: "string" },
        notes:     { type: "string" },
      },
      required: ["full_name"],
    },
  },
  {
    name: "update_customer",
    description: "Aktualizuje dane klienta.",
    input_schema: {
      type: "object",
      properties: {
        customer_id: { type: "string" },
        full_name:   { type: "string" },
        phone:       { type: "string" },
        email:       { type: "string" },
        address:     { type: "string" },
        city:        { type: "string" },
        notes:       { type: "string" },
      },
      required: ["customer_id"],
    },
  },
  {
    name: "search_customers",
    description: "Wyszukuje klientów po imieniu/nazwisku, telefonie lub mieście.",
    input_schema: {
      type: "object",
      properties: {
        query:  { type: "string", description: "Szukaj po nazwisku, imieniu, telefonie lub mieście" },
        by:     { type: "string", enum: ["name","phone","city"], description: "Pole wyszukiwania (domyślnie name)" },
        limit:  { type: "number" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_customer",
    description: "Pobiera dane klienta wraz z historią jego zleceń.",
    input_schema: {
      type: "object",
      properties: { customer_id: { type: "string" } },
      required: ["customer_id"],
    },
  },

  // --- KOSZTY ---
  {
    name: "add_job_cost",
    description: "Dodaje pozycję kosztu do zlecenia (materiały, dojazd itp.).",
    input_schema: {
      type: "object",
      properties: {
        job_id:      { type: "string" },
        description: { type: "string" },
        amount:      { type: "number" },
        cost_date:   { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["job_id","description","amount"],
    },
  },
  {
    name: "delete_job_cost",
    description: "Usuwa pozycję kosztu.",
    input_schema: {
      type: "object",
      properties: { cost_id: { type: "string" } },
      required: ["cost_id"],
    },
  },

  // --- KALENDARZ ---
  {
    name: "get_calendar_events",
    description: "Pobiera zlecenia z terminami z danego zakresu dat.",
    input_schema: {
      type: "object",
      properties: {
        date_from: { type: "string" },
        date_to:   { type: "string" },
      },
      required: ["date_from","date_to"],
    },
  },

  // --- FINANSE ---
  {
    name: "get_financial_summary",
    description: "Zwraca podsumowanie finansowe za dany miesiąc lub rok.",
    input_schema: {
      type: "object",
      properties: {
        year:  { type: "number" },
        month: { type: "number", description: "1-12, pomiń dla całego roku" },
      },
      required: ["year"],
    },
  },
  {
    name: "get_dashboard_stats",
    description: "Pobiera statystyki dashboardu: zlecenia dziś, nieopłacone, przychód miesiąca.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },

  // --- KATEGORIE ---
  {
    name: "list_service_categories",
    description: "Pobiera listę kategorii usług z cenami bazowymi.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },

  // --- NAWIGACJA ---
  {
    name: "navigate_to",
    description: "Instruuje frontend żeby przeszedł do konkretnej strony aplikacji.",
    input_schema: {
      type: "object",
      properties: {
        route: {
          type: "string",
          enum: ["/","/jobs","/jobs/new","/calendar","/customers","/finance","/settings"],
        },
        job_id:      { type: "string" },
        customer_id: { type: "string" },
      },
      required: ["route"],
    },
  },
];
