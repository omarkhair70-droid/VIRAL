# Baddelha UI Icon System v1

## Purpose
This pack gives **بدّلها** a single, consistent icon language across the app instead of ad-hoc emoji or mixed icon styles.

## Visual rules
- ViewBox: `0 0 24 24`
- Stroke: `currentColor`
- Stroke width: `1.9` by default
- Rounded joins / rounded caps
- Outline-first, calm, clean, app-like
- No filled decorative icons unless a future branded exception is documented
- Icons should inherit text color from their parent surface

## File location
All icons live in:

```txt
public/ui-icons/
```

## Included icons
- `back`
- `bell`
- `calendar`
- `camera`
- `chat`
- `check`
- `clock`
- `copy`
- `deal`
- `edit`
- `empty-box`
- `feedback`
- `filter`
- `forward`
- `heart`
- `home`
- `image`
- `location`
- `logout`
- `market`
- `menu`
- `offer`
- `profile`
- `publish`
- `report`
- `search`
- `settings`
- `share`
- `shield`
- `spark`
- `star`
- `story`
- `swap`
- `tag`
- `trash`
- `upload`
- `user-plus`
- `warning`

## Recommended app mapping
| Surface | Suggested icon |
|---|---|
| Home | `home` |
| Marketplace | `market` |
| Publish / add item | `publish` |
| Notifications | `bell` |
| Profile / account | `profile` |
| Search | `search` |
| Filter | `filter` |
| Swap | `swap` |
| Story item | `story` |
| Offers | `offer` |
| Deals | `deal` |
| Messages | `chat` |
| Safety | `shield` |
| Report | `report` |
| Feedback | `feedback` |
| Edit | `edit` |
| Delete | `trash` |
| Share | `share` |
| Copy | `copy` |
| Item image | `image` |
| Camera | `camera` |
| Upload | `upload` |
| Location | `location` |
| Rating | `star` |
| Success | `check` |
| Waiting / timeline | `clock` |
| Menu | `menu` |
| Logout | `logout` |
| Settings | `settings` |
| Back | `back` |
| Forward | `forward` |
| Favorite / saved later | `heart` |
| Premium / drops highlight later | `spark` |
| Category / label | `tag` |
| Invite / creator later | `user-plus` |
| Warning | `warning` |
| Empty state generic | `empty-box` |
| Dates / drop schedule later | `calendar` |

## Usage guidance
### Inline
Use SVG paths directly only when needed for a tiny one-off component.

### Preferred for app-wide use
Reference the files from `/ui-icons/<name>.svg` or wrap them in a shared component during the Codex integration phase.

### Sizes
- 16px: dense inline controls
- 18–20px: bottom nav / top utilities
- 24px: section headers / empty states
- 32px+: rare, only for illustrations or empty-state hero marks

## Do not
- Do not mix emoji icons with this pack in product UI.
- Do not use three unrelated icon families in the same surface.
- Do not change stroke widths icon-by-icon without documenting the reason.
- Do not use decorative icons where a text label is clearer.

## Next integration target
When Codex resets, wire this pack into:
1. Mobile bottom nav
2. Mobile header utility icons
3. Empty states
4. Notification / safety / report / feedback screens
5. Offer/deal/status actions
6. Publish Item 2.0 wizard supporting visuals
