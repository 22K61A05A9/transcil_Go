import { useEffect, useState } from "react";

import { getPlayers, getPlayerById, updatePlayer } from "../api/playerApi";

import type { PlayerFilters, SortField, SortOrder } from "../api/playerApi";

import type { Player, UpdatePlayerRequest } from "../types/player";

import Navbar from "../components/Navbar";
import PlayerTable from "../components/PlayerTable";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

import "../styles/players.css";

/* ========================================================
   DATE VALIDATION
======================================================== */

const isValidDate = (value: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/* ========================================================
   EDIT FORM VALIDATION
======================================================== */

const validateEditForm = (
  form: UpdatePlayerRequest,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  /* ------------------------------------------------------
     FIRST NAME
  ------------------------------------------------------ */

  const firstName = form.nameFirst.trim();

  if (!firstName) {
    errors.nameFirst = "First name is required.";
  } else if (firstName.length < 2) {
    errors.nameFirst = "First name must contain at least 2 characters.";
  } else if (!/^[A-Za-z\s'-]+$/.test(firstName)) {
    errors.nameFirst = "First name can contain only letters.";
  }

  /* ------------------------------------------------------
     LAST NAME
  ------------------------------------------------------ */

  const lastName = form.nameLast.trim();

  if (!lastName) {
    errors.nameLast = "Last name is required.";
  } else if (lastName.length < 2) {
    errors.nameLast = "Last name must contain at least 2 characters.";
  } else if (!/^[A-Za-z\s'-]+$/.test(lastName)) {
    errors.nameLast = "Last name can contain only letters.";
  }

  /* ------------------------------------------------------
     GIVEN NAME
  ------------------------------------------------------ */

  const givenName = form.nameGiven.trim();

  if (givenName && !/^[A-Za-z\s'-]+$/.test(givenName)) {
    errors.nameGiven = "Given name can contain only letters.";
  }

  /* ------------------------------------------------------
     BIRTH YEAR
  ------------------------------------------------------ */

  if (
    form.birthYear !== null &&
    (form.birthYear < 1800 || form.birthYear > new Date().getFullYear())
  ) {
    errors.birthYear = "Enter a valid birth year.";
  }

  /* ------------------------------------------------------
     BIRTH MONTH
  ------------------------------------------------------ */

  if (
    form.birthMonth !== null &&
    (form.birthMonth < 1 || form.birthMonth > 12)
  ) {
    errors.birthMonth = "Birth month must be between 1 and 12.";
  }

  /* ------------------------------------------------------
     BIRTH DAY
  ------------------------------------------------------ */

  if (form.birthDay !== null && (form.birthDay < 1 || form.birthDay > 31)) {
    errors.birthDay = "Birth day must be between 1 and 31.";
  }

  /* ------------------------------------------------------
     COUNTRY
  ------------------------------------------------------ */

  if (!form.birthCountry.trim()) {
    errors.birthCountry = "Birth country is required.";
  }

  /* ------------------------------------------------------
     CITY
  ------------------------------------------------------ */

  if (!form.birthCity.trim()) {
    errors.birthCity = "Birth city is required.";
  }

  /* ------------------------------------------------------
     WEIGHT
  ------------------------------------------------------ */

  if (form.weight !== null && form.weight <= 0) {
    errors.weight = "Weight must be greater than 0.";
  }

  /* ------------------------------------------------------
     HEIGHT
  ------------------------------------------------------ */

  if (form.height !== null && form.height <= 0) {
    errors.height = "Height must be greater than 0.";
  }

  /* ------------------------------------------------------
     BATS
  ------------------------------------------------------ */

  if (form.bats && !["R", "L", "B"].includes(form.bats.toUpperCase())) {
    errors.bats = "Bats must be R, L, or B.";
  }

  /* ------------------------------------------------------
     THROWS
  ------------------------------------------------------ */

  if (form.throws && !["R", "L"].includes(form.throws.toUpperCase())) {
    errors.throws = "Throws must be R or L.";
  }

  /* ------------------------------------------------------
     DEBUT DATE
  ------------------------------------------------------ */

  if (form.debut && !isValidDate(form.debut)) {
    errors.debut = "Use date format YYYY-MM-DD.";
  }

  /* ------------------------------------------------------
     FINAL GAME DATE
  ------------------------------------------------------ */

  if (form.finalGame && !isValidDate(form.finalGame)) {
    errors.finalGame = "Use date format YYYY-MM-DD.";
  }

  return errors;
};

/* ========================================================
   PLAYERS PAGE
======================================================== */

function PlayersPage() {
  /* ======================================================
     STATE
  ====================================================== */

  const [players, setPlayers] = useState<Player[]>([]);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalPlayers, setTotalPlayers] = useState(0);

  const [loading, setLoading] = useState(true);

  const [searchLoading, setSearchLoading] = useState(false);

  // Only the first API request uses the full-page loader.
  // Later requests keep the page mounted so input focus/cursor
  // is not lost while the user is typing.
  const [initialLoad, setInitialLoad] = useState(true);

  const [error, setError] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [playerLoading, setPlayerLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState<UpdatePlayerRequest | null>(null);

  const [saving, setSaving] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ======================================================
     SORTING
  ====================================================== */

  const [sortBy, setSortBy] = useState<SortField>("firstName");

  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  /* ======================================================
   MULTI FILTERS
====================================================== */

  const [filters, setFilters] = useState<PlayerFilters>({
    birthCountry: "",
    birthState: "",
    bats: undefined,
    throws: undefined,

    minBirthYear: undefined,
    maxBirthYear: undefined,

    minHeight: undefined,
    maxHeight: undefined,

    minWeight: undefined,
    maxWeight: undefined,
  });

  const limit = 20;

  /* ======================================================
     LOAD PLAYERS
     ====================================================== */

  useEffect(() => {
    const trimmedSearch = search.trim();

    const isSearching = trimmedSearch.length >= 2;

    /*
     * Check whether any filter is active.
     */
    const hasFilters =
      Boolean(filters.birthCountry) ||
      Boolean(filters.birthState) ||
      Boolean(filters.bats) ||
      Boolean(filters.throws) ||
      filters.minBirthYear !== undefined ||
      filters.maxBirthYear !== undefined ||
      filters.minHeight !== undefined ||
      filters.maxHeight !== undefined ||
      filters.minWeight !== undefined ||
      filters.maxWeight !== undefined;

    /*
     * Do not search for one character.
     *
     * But if filters are active, still allow the filters
     * to work while ignoring the one-character search.
     */
    if (trimmedSearch.length === 1 && !hasFilters) {
      return;
    }

    let cancelled = false;

    const loadPlayers = async () => {
      try {
        /*
         * Only the first request uses the full-page loader.
         * Later requests keep the page mounted so input focus
         * and the cursor are not lost while typing.
         */
        if (initialLoad) {
          setLoading(true);
        } else {
          setSearchLoading(true);
        }

        setError("");

        const response = await getPlayers(
          currentPage,
          limit,
          isSearching ? trimmedSearch : "",
          sortBy,
          sortOrder,
          filters,
        );

        if (cancelled) {
          return;
        }

        setPlayers(response.data);

        setTotalPages(response.pagination.totalPages);

        setTotalPlayers(response.pagination.totalPlayers);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load players:", error);

        setError("Failed to load players.");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSearchLoading(false);

          /*
           * All future requests are background refreshes.
           */
          setInitialLoad(false);
        }
      }
    };

    /*
     * Debounce search and filter requests.
     *
     * This prevents an API request for every keystroke.
     */
    const delay = initialLoad ? 0 : isSearching || hasFilters ? 350 : 0;

    const timer = window.setTimeout(loadPlayers, delay);

    return () => {
      cancelled = true;

      window.clearTimeout(timer);
    };
  }, [
    currentPage,
    search,
    sortBy,
    sortOrder,

    filters.birthCountry,
    filters.birthState,
    filters.bats,
    filters.throws,

    filters.minBirthYear,
    filters.maxBirthYear,

    filters.minHeight,
    filters.maxHeight,

    filters.minWeight,
    filters.maxWeight,
  ]);

  /* ======================================================
     SEARCH
  ====================================================== */

  const handleSearchChange = (value: string) => {
    setSearch(value);

    /*
     * Whenever search changes,
     * start from page 1.
     */

    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };
  /* ======================================================
   FILTER CHANGE
====================================================== */

  const handleFilterChange = (field: keyof PlayerFilters, value: string) => {
    setFilters((previous) => {
      const numericFields: Array<keyof PlayerFilters> = [
        "minBirthYear",
        "maxBirthYear",
        "minHeight",
        "maxHeight",
        "minWeight",
        "maxWeight",
      ];

      if (numericFields.includes(field)) {
        return {
          ...previous,
          [field]: value === "" ? undefined : Number(value),
        };
      }

      if (field === "bats") {
        return {
          ...previous,
          bats: value === "" ? undefined : (value as "R" | "L" | "B"),
        };
      }

      if (field === "throws") {
        return {
          ...previous,
          throws: value === "" ? undefined : (value as "R" | "L"),
        };
      }

      return {
        ...previous,
        [field]: value,
      };
    });

    // Every new filter starts from page 1.
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  /* ======================================================
   CLEAR FILTERS
====================================================== */

  const handleClearFilters = () => {
    setFilters({
      birthCountry: "",
      birthState: "",
      bats: undefined,
      throws: undefined,

      minBirthYear: undefined,
      maxBirthYear: undefined,

      minHeight: undefined,
      maxHeight: undefined,

      minWeight: undefined,
      maxWeight: undefined,
    });

    setCurrentPage(1);
  };

  /* ======================================================
   SORTING
====================================================== */

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      /*
       * Same column clicked:
       *
       * ASC  -> DESC
       * DESC -> ASC
       */
      setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      /*
       * New column:
       * start with ASC.
       */
      setSortBy(field);
      setSortOrder("asc");
    }

    /*
     * Sorting should always
     * start from page 1.
     */
    setCurrentPage(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  /*=================================================
     PAGE CHANGE
  ====================================================== */

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ======================================================
     VIEW PLAYER
  ====================================================== */

  const handleViewPlayer = async (playerID: string) => {
    try {
      setPlayerLoading(true);
      setError("");

      setIsEditing(false);
      setEditForm(null);
      setFormErrors({});

      const player = await getPlayerById(playerID);

      setSelectedPlayer(player);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Failed to load player details:", error);

      setError("Failed to load player details.");
    } finally {
      setPlayerLoading(false);
    }
  };

  /* ======================================================
     CLOSE DETAILS
  ====================================================== */

  const closePlayerDetails = () => {
    if (saving) {
      return;
    }

    setSelectedPlayer(null);
    setIsEditing(false);
    setEditForm(null);
    setFormErrors({});
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ======================================================
     START EDIT
  ====================================================== */

  const handleEdit = () => {
    if (!selectedPlayer) {
      return;
    }

    setEditForm({
      nameFirst: selectedPlayer.nameFirst ?? "",

      nameLast: selectedPlayer.nameLast ?? "",

      nameGiven: selectedPlayer.nameGiven ?? "",

      birthYear: selectedPlayer.birthYear ?? null,

      birthMonth: selectedPlayer.birthMonth ?? null,

      birthDay: selectedPlayer.birthDay ?? null,

      birthCountry: selectedPlayer.birthCountry ?? "",

      birthState: selectedPlayer.birthState ?? "",

      birthCity: selectedPlayer.birthCity ?? "",

      weight: selectedPlayer.weight ?? null,

      height: selectedPlayer.height ?? null,

      bats: selectedPlayer.bats ?? "",

      throws: selectedPlayer.throws ?? "",

      debut: selectedPlayer.debut ?? "",

      finalGame: selectedPlayer.finalGame ?? "",
    });

    setFormErrors({});
    setError("");
    setIsEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ======================================================
     EDIT FIELD CHANGE
  ====================================================== */

  const handleEditChange = (
    field: keyof UpdatePlayerRequest,
    value: string,
  ) => {
    setEditForm((previous) => {
      if (!previous) {
        return previous;
      }

      const numericFields: Array<keyof UpdatePlayerRequest> = [
        "birthYear",
        "birthMonth",
        "birthDay",
        "weight",
        "height",
      ];

      if (numericFields.includes(field)) {
        return {
          ...previous,

          [field]: value === "" ? null : Number(value),
        };
      }

      return {
        ...previous,

        [field]: value,
      };
    });

    /*
     * Remove the error for this field
     * as soon as the user changes it.
     */

    setFormErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const updated = {
        ...previous,
      };

      delete updated[field];

      return updated;
    });
  };

  /* ======================================================
     CANCEL EDIT
  ====================================================== */

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
    setFormErrors({});
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ======================================================
     SAVE PLAYER
  ====================================================== */

  const handleSave = async () => {
    if (!selectedPlayer || !editForm) {
      return;
    }

    /*
     * STEP 1:
     * Validate complete form.
     */

    const validationErrors = validateEditForm(editForm);

    /*
     * STEP 2:
     * Show validation errors.
     */

    setFormErrors(validationErrors);

    /*
     * STEP 3:
     * Stop if validation failed.
     */

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * STEP 4:
       * Send valid data to backend.
       */

      const updatedPlayer = await updatePlayer(
        selectedPlayer.playerID,
        editForm,
      );

      /*
       * STEP 5:
       * Update details page.
       */

      setSelectedPlayer(updatedPlayer);

      /*
       * STEP 6:
       * Update player in table.
       */

      setPlayers((previousPlayers) =>
        previousPlayers.map((player) =>
          player.playerID === updatedPlayer.playerID ? updatedPlayer : player,
        ),
      );

      /*
       * STEP 7:
       * Exit edit mode.
       */

      setIsEditing(false);
      setEditForm(null);
      setFormErrors({});
    } catch (error) {
      console.error("Failed to update player:", error);

      setError("Failed to update player.");
    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
     SEARCH STATUS
  ====================================================== */

  const trimmedSearch = search.trim();

  const isSearching = trimmedSearch.length >= 2;
  const hasActiveFilters =
    Boolean(filters.birthCountry) ||
    Boolean(filters.birthState) ||
    Boolean(filters.bats) ||
    Boolean(filters.throws) ||
    filters.minBirthYear !== undefined ||
    filters.maxBirthYear !== undefined ||
    filters.minHeight !== undefined ||
    filters.maxHeight !== undefined ||
    filters.minWeight !== undefined ||
    filters.maxWeight !== undefined;
  /* ======================================================
     LOADING
  ====================================================== */

  if (loading && !selectedPlayer) {
    return (
      <div className="page-state">
        <div className="loader"></div>

        <p>Loading players...</p>
      </div>
    );
  }

  /* ======================================================
     FULL SCREEN PLAYER DETAILS
  ====================================================== */

  if (selectedPlayer) {
    return (
      <div className="player-details-page">
        <Navbar />

        <main className="player-details-content">
          {/* ==================================================
              TOP BAR
          ================================================== */}

          <div className="details-topbar">
            <button
              type="button"
              className="back-button"
              onClick={closePlayerDetails}
              disabled={saving}
            >
              ← Back to Players
            </button>

            {!isEditing && (
              <button
                type="button"
                className="edit-button"
                onClick={handleEdit}
              >
                Edit Player
              </button>
            )}
          </div>

          {/* ==================================================
              PLAYER HEADER
          ================================================== */}

          <section className="details-header">
            <div>
              <p className="details-label">PLAYER DETAILS</p>

              <h1>
                {selectedPlayer.nameFirst ?? ""} {selectedPlayer.nameLast ?? ""}
              </h1>

              <p className="details-id">Player ID: {selectedPlayer.playerID}</p>
            </div>
          </section>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && <div className="details-error">{error}</div>}

          {/* ==================================================
              VIEW MODE
          ================================================== */}

          {!isEditing && (
            <div className="details-card">
              {/* PERSONAL */}

              <section className="details-section">
                <h2>Personal Information</h2>

                <div className="details-grid">
                  <DetailItem
                    label="Player ID"
                    value={selectedPlayer.playerID}
                  />

                  <DetailItem
                    label="First Name"
                    value={selectedPlayer.nameFirst}
                  />

                  <DetailItem
                    label="Last Name"
                    value={selectedPlayer.nameLast}
                  />

                  <DetailItem
                    label="Given Name"
                    value={selectedPlayer.nameGiven}
                  />
                </div>
              </section>

              {/* BIRTH */}

              <section className="details-section">
                <h2>Birth Information</h2>

                <div className="details-grid">
                  <DetailItem
                    label="Birth Year"
                    value={selectedPlayer.birthYear}
                  />

                  <DetailItem
                    label="Birth Month"
                    value={selectedPlayer.birthMonth}
                  />

                  <DetailItem
                    label="Birth Day"
                    value={selectedPlayer.birthDay}
                  />

                  <DetailItem
                    label="Birth Country"
                    value={selectedPlayer.birthCountry}
                  />

                  <DetailItem
                    label="Birth State"
                    value={selectedPlayer.birthState}
                  />

                  <DetailItem
                    label="Birth City"
                    value={selectedPlayer.birthCity}
                  />
                </div>
              </section>

              {/* PHYSICAL */}

              <section className="details-section">
                <h2>Physical Information</h2>

                <div className="details-grid">
                  <DetailItem
                    label="Height"
                    value={
                      selectedPlayer.height != null
                        ? `${selectedPlayer.height} in`
                        : undefined
                    }
                  />

                  <DetailItem
                    label="Weight"
                    value={
                      selectedPlayer.weight != null
                        ? `${selectedPlayer.weight} lb`
                        : undefined
                    }
                  />

                  <DetailItem label="Bats" value={selectedPlayer.bats} />

                  <DetailItem label="Throws" value={selectedPlayer.throws} />
                </div>
              </section>

              {/* CAREER */}

              <section className="details-section">
                <h2>Career Information</h2>

                <div className="details-grid">
                  <DetailItem label="Debut" value={selectedPlayer.debut} />

                  <DetailItem
                    label="Final Game"
                    value={selectedPlayer.finalGame}
                  />

                  <DetailItem label="Retro ID" value={selectedPlayer.retroID} />

                  <DetailItem label="BBRef ID" value={selectedPlayer.bbrefID} />
                </div>
              </section>

              {/* DEATH */}

              <section className="details-section">
                <h2>Death Information</h2>

                <div className="details-grid">
                  <DetailItem
                    label="Death Year"
                    value={selectedPlayer.deathYear}
                  />

                  <DetailItem
                    label="Death Month"
                    value={selectedPlayer.deathMonth}
                  />

                  <DetailItem
                    label="Death Day"
                    value={selectedPlayer.deathDay}
                  />

                  <DetailItem
                    label="Death Country"
                    value={selectedPlayer.deathCountry}
                  />

                  <DetailItem
                    label="Death State"
                    value={selectedPlayer.deathState}
                  />

                  <DetailItem
                    label="Death City"
                    value={selectedPlayer.deathCity}
                  />
                </div>
              </section>
            </div>
          )}

          {/* ==================================================
              EDIT MODE
          ================================================== */}

          {isEditing && editForm && (
            <div className="details-card">
              <section className="details-section">
                <div className="edit-section-header">
                  <div>
                    <p className="details-label">EDIT PLAYER</p>

                    <h2>Update Player Information</h2>
                  </div>
                </div>

                <div className="edit-form">
                  <EditInput
                    label="First Name"
                    value={editForm.nameFirst}
                    error={formErrors.nameFirst}
                    onChange={(value) => handleEditChange("nameFirst", value)}
                  />

                  <EditInput
                    label="Last Name"
                    value={editForm.nameLast}
                    error={formErrors.nameLast}
                    onChange={(value) => handleEditChange("nameLast", value)}
                  />

                  <EditInput
                    label="Given Name"
                    value={editForm.nameGiven}
                    error={formErrors.nameGiven}
                    onChange={(value) => handleEditChange("nameGiven", value)}
                  />

                  <EditInput
                    label="Birth Year"
                    type="number"
                    value={editForm.birthYear}
                    error={formErrors.birthYear}
                    onChange={(value) => handleEditChange("birthYear", value)}
                  />

                  <EditInput
                    label="Birth Month"
                    type="number"
                    value={editForm.birthMonth}
                    error={formErrors.birthMonth}
                    onChange={(value) => handleEditChange("birthMonth", value)}
                  />

                  <EditInput
                    label="Birth Day"
                    type="number"
                    value={editForm.birthDay}
                    error={formErrors.birthDay}
                    onChange={(value) => handleEditChange("birthDay", value)}
                  />

                  <EditInput
                    label="Birth Country"
                    value={editForm.birthCountry}
                    error={formErrors.birthCountry}
                    onChange={(value) =>
                      handleEditChange("birthCountry", value)
                    }
                  />

                  <EditInput
                    label="Birth State"
                    value={editForm.birthState}
                    error={formErrors.birthState}
                    onChange={(value) => handleEditChange("birthState", value)}
                  />

                  <EditInput
                    label="Birth City"
                    value={editForm.birthCity}
                    error={formErrors.birthCity}
                    onChange={(value) => handleEditChange("birthCity", value)}
                  />

                  <EditInput
                    label="Weight"
                    type="number"
                    value={editForm.weight}
                    error={formErrors.weight}
                    onChange={(value) => handleEditChange("weight", value)}
                  />

                  <EditInput
                    label="Height"
                    type="number"
                    value={editForm.height}
                    error={formErrors.height}
                    onChange={(value) => handleEditChange("height", value)}
                  />

                  <EditInput
                    label="Bats"
                    value={editForm.bats}
                    error={formErrors.bats}
                    onChange={(value) => handleEditChange("bats", value)}
                  />

                  <EditInput
                    label="Throws"
                    value={editForm.throws}
                    error={formErrors.throws}
                    onChange={(value) => handleEditChange("throws", value)}
                  />

                  <EditInput
                    label="Debut"
                    value={editForm.debut}
                    error={formErrors.debut}
                    onChange={(value) => handleEditChange("debut", value)}
                  />

                  <EditInput
                    label="Final Game"
                    value={editForm.finalGame}
                    error={formErrors.finalGame}
                    onChange={(value) => handleEditChange("finalGame", value)}
                  />
                </div>

                {/* ACTIONS */}

                <div className="details-form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="save-button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>

        {/* PLAYER LOADING */}

        {playerLoading && (
          <div className="details-loading">
            <div className="loader"></div>

            <p>Loading player details...</p>
          </div>
        )}
      </div>
    );
  }

  /* ========================================================
     MAIN PLAYER LIST
  ======================================================== */

  return (
    <div className="app">
      <Navbar />

      <main className="players-page">
        {/* PAGE HEADER */}

        <section className="page-header">
          <div>
            <p className="page-label">PLAYER DATABASE</p>

            <h1>Player Directory</h1>

            <p className="page-description">
              Search and discover players from the database.
            </p>
          </div>

          <div className="player-count">
            <strong>{totalPlayers}</strong>

            <span>
              {isSearching || hasActiveFilters
                ? "Matching Players"
                : "Total Players"}
            </span>
          </div>
        </section>

        {/* SEARCH */}

        <SearchBar value={search} onChange={handleSearchChange} />
        {/* ======================================================
    FILTERS
====================================================== */}

        <section className="filters-panel">
          <div className="filters-header">
            <div>
              <h3>Filters</h3>

              <p>Narrow players using multiple filters.</p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters-button"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* BIRTH COUNTRY */}

            <label className="filter-field">
              <span>Birth Country</span>

              <input
                type="text"
                placeholder="e.g. USA"
                value={filters.birthCountry ?? ""}
                onChange={(event) =>
                  handleFilterChange("birthCountry", event.target.value)
                }
              />
            </label>

            {/* BIRTH STATE */}

            <label className="filter-field">
              <span>Birth State</span>

              <input
                type="text"
                placeholder="e.g. GA"
                value={filters.birthState ?? ""}
                onChange={(event) =>
                  handleFilterChange("birthState", event.target.value)
                }
              />
            </label>

            {/* BATS */}

            <label className="filter-field">
              <span>Bats</span>

              <select
                value={filters.bats ?? ""}
                onChange={(event) =>
                  handleFilterChange("bats", event.target.value)
                }
              >
                <option value="">All</option>
                <option value="R">Right (R)</option>
                <option value="L">Left (L)</option>
                <option value="B">Both (B)</option>
              </select>
            </label>

            {/* THROWS */}

            <label className="filter-field">
              <span>Throws</span>

              <select
                value={filters.throws ?? ""}
                onChange={(event) =>
                  handleFilterChange("throws", event.target.value)
                }
              >
                <option value="">All</option>
                <option value="R">Right (R)</option>
                <option value="L">Left (L)</option>
              </select>
            </label>

            {/* BIRTH YEAR MIN */}

            <label className="filter-field">
              <span>Birth Year From</span>

              <input
                type="number"
                placeholder="From"
                value={filters.minBirthYear ?? ""}
                onChange={(event) =>
                  handleFilterChange("minBirthYear", event.target.value)
                }
              />
            </label>

            {/* BIRTH YEAR MAX */}

            <label className="filter-field">
              <span>Birth Year To</span>

              <input
                type="number"
                placeholder="To"
                value={filters.maxBirthYear ?? ""}
                onChange={(event) =>
                  handleFilterChange("maxBirthYear", event.target.value)
                }
              />
            </label>

            {/* HEIGHT MIN */}

            <label className="filter-field">
              <span>Height From</span>

              <input
                type="number"
                placeholder="From"
                value={filters.minHeight ?? ""}
                onChange={(event) =>
                  handleFilterChange("minHeight", event.target.value)
                }
              />
            </label>

            {/* HEIGHT MAX */}

            <label className="filter-field">
              <span>Height To</span>

              <input
                type="number"
                placeholder="To"
                value={filters.maxHeight ?? ""}
                onChange={(event) =>
                  handleFilterChange("maxHeight", event.target.value)
                }
              />
            </label>

            {/* WEIGHT MIN */}

            <label className="filter-field">
              <span>Weight From</span>

              <input
                type="number"
                placeholder="From"
                value={filters.minWeight ?? ""}
                onChange={(event) =>
                  handleFilterChange("minWeight", event.target.value)
                }
              />
            </label>

            {/* WEIGHT MAX */}

            <label className="filter-field">
              <span>Weight To</span>

              <input
                type="number"
                placeholder="To"
                value={filters.maxWeight ?? ""}
                onChange={(event) =>
                  handleFilterChange("maxWeight", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        {search.trim().length === 1 && (
          <div className="search-status">
            Type at least 2 characters to search.
          </div>
        )}

        {searchLoading && (
          <div className="search-status">Searching players...</div>
        )}

        {/* TABLE */}

        <section className="table-section">
          <div className="table-header">
            <div>
              <h2>Players</h2>

              <p>
                {isSearching
                  ? `Search results for "${trimmedSearch}"`
                  : `Showing page ${currentPage} of ${totalPages}`}
              </p>
            </div>
          </div>

          {error && !selectedPlayer && (
            <div className="details-error">{error}</div>
          )}

          {players.length > 0 ? (
            <PlayerTable
              players={players}
              onView={handleViewPlayer}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          ) : (
            <div className="no-results">
              <div className="no-results-icon">⌕</div>

              <h3>No players found</h3>

              <p>
                {isSearching
                  ? `No players match "${trimmedSearch}".`
                  : hasActiveFilters
                    ? "No players match the selected filters."
                    : "No players are available."}
              </p>

              <p>
                {isSearching || hasActiveFilters
                  ? "Try changing your search or filters."
                  : "No players are available."}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </main>
    </div>
  );
}

/* ========================================================
   DETAIL ITEM
======================================================== */

interface DetailItemProps {
  label: string;
  value?: string | number | null;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <span>{label}</span>

      <strong>
        {value !== undefined && value !== null && value !== "" ? value : "—"}
      </strong>
    </div>
  );
}

/* ========================================================
   EDIT INPUT
======================================================== */

interface EditInputProps {
  label: string;

  value: string | number | null;

  type?: "text" | "number";

  error?: string;

  onChange: (value: string) => void;
}

function EditInput({
  label,
  value,
  type = "text",
  error,
  onChange,
}: EditInputProps) {
  return (
    <label className="edit-field">
      <span>{label}</span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={error ? "input-error" : ""}
      />

      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export default PlayersPage;
