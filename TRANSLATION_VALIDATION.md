# Translation Validation Status

**Last Updated:** 2025-01-22

## Completeness Status by Language

| Language | Code | Status | Missing Sections | Last Verified |
|----------|------|--------|-----------------|---------------|
| English | en.json | ✅ COMPLETE (Reference) | None | 2025-01-22 |
| Arabic | ar.json | ⚠️ INCOMPLETE | subscription, many reporting keys | 2025-01-22 |
| Chinese | zh.json | ⚠️ PARTIAL | Some subscription keys added | 2025-01-22 |
| Danish | da.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| German | de.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Spanish | es.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| French | fr.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Hindi | hi.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Indonesian | id.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Italian | it.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Japanese | ja.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Korean | ko.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Dutch | nl.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Polish | pl.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Portuguese | pt.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Russian | ru.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Swedish | sv.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Thai | th.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Turkish | tr.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |
| Vietnamese | vi.json | ❌ INCOMPLETE | subscription, plans, reporting, payment | Never |

## Key Sections to Verify

When adding/modifying features, these sections must exist in ALL languages:

### Core Sections (CRITICAL)
- `dashboard` - Main dashboard UI
- `auth` - Authentication flows
- `common` - Shared labels, buttons, units
- `subscription` - Subscription gates, tiers, status (⚠️ MISSING IN MOST)
- `payment` - Payment dialogs and forms (⚠️ MISSING IN MOST)

### Feature Sections
- `plans` - Plan names (singleDevice, personal, personalPro, etc.) (⚠️ MISSING IN MOST)
- `planFeatures` - Feature lists for each plan (⚠️ MISSING IN MOST)
- `subscriptionPlans` - Plan selection UI (⚠️ MISSING IN MOST)
- `paymentMethods` - Payment method cards (⚠️ MISSING IN MOST)
- `reporting` - Advanced reporting UI (⚠️ INCOMPLETE IN MOST)
- `analytics` - Analytics dashboard
- `network` - Network status and topology
- `xxCoin` - XX Coin wallet and transactions
- `dao` - DAO governance
- `bandwidth` - Bandwidth monitoring

### Status Indicators
- `status` - Connection status labels
- `units` - Measurement units (MB, GB, Mbps, ms)
- `timeUnits` - Time labels (hours, minutes, seconds)

## Validation Commands

### Check for hardcoded text violations:
```bash
grep -r "Loading\.\.\." src/components/  # Should return ZERO results
grep -r "Mbps" src/components/           # Should return ZERO results (use t('units.mbps'))
grep -r "\".*\"" src/components/*.tsx | grep -v "t('"  # Find untranslated strings
```

### Check for missing formatNumber() calls:
```bash
grep -r "\.toFixed(" src/components/     # Should use formatNumber() instead
grep -r "> [0-9]" src/components/        # Numbers should use formatNumber()
```

### Verify translation key exists in all files:
```bash
# Example: Check if 'subscription.required' exists in all languages
for lang in ar da de es fr hi id it ja ko nl pl pt ru sv th tr vi zh; do
  echo -n "$lang: "
  grep -c "\"required\":" src/locales/${lang}.json || echo "MISSING"
done
```

## Recently Added Keys (Need Propagation)

### Added 2025-01-22:
- `subscription.*` (41 keys) - Added to en.json, zh.json only
- `payment.*` (8 keys) - Added to en.json, zh.json, ar.json only
- `plans.*` (7 keys) - Added to zh.json only
- `planFeatures.*` (33 keys) - Added to zh.json only
- `paymentMethods.*` (17 keys) - Added to zh.json only

**Action Required:** These keys must be added to 17+ remaining language files.

## Critical Statistics

- **Total translation keys in en.json:** ~1,117 lines (500+ unique keys)
- **Average completeness across all languages:** ~60%
- **Languages at 90%+ completeness:** 2 (en, zh partial)
- **Languages at <50% completeness:** 17

## Next Steps

1. **Immediate:** Add missing `subscription`, `payment`, `plans`, `planFeatures`, `paymentMethods` sections to all 17 incomplete languages
2. **Short-term:** Implement pre-commit hook to validate translation completeness
3. **Long-term:** Add automated translation key sync to CI/CD pipeline

---

**Note:** This file should be updated EVERY TIME a new translation key is added to en.json.
