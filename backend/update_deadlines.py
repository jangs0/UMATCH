import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SECRET_KEY")
)

# Key = exact scorecard_id, value = (ed1, ed2, ea, rd, notes)
DEADLINES_BY_ID = {
    166027: (None, None, "1-Nov", "1-Jan", "REA"),
    130794: (None, None, "1-Nov", "2-Jan", "SCEA"),
    186131: (None, None, "1-Nov", "1-Jan", "SCEA"),
    166683: (None, None, "1-Nov", "1-Jan", None),
    110404: (None, None, "1-Nov", "3-Jan", None),
    182670: ("1-Nov", None, None, "2-Jan", None),
    217156: ("1-Nov", None, None, "1-Jan", "NB since 2025"),
    190150: ("1-Nov", None, None, "1-Jan", None),
    215062: ("1-Nov", None, None, "5-Jan", None),
    190415: ("1-Nov", None, None, "2-Jan", None),
    243744: (None, None, "1-Nov", "5-Jan", "REA"),
    144050: ("1-Nov", "3-Jan", "1-Nov", "3-Jan", "EA + ED both offered"),
    198419: ("2-Nov", None, None, "4-Jan", None),      # Duke
    221999: ("1-Nov", "1-Jan", None, "1-Jan", None),   # Vanderbilt
    227757: ("1-Nov", "4-Jan", None, "4-Jan", None),   # Rice
    147767: ("1-Nov", None, None, "2-Jan", None),      # Northwestern
    162928: ("1-Nov", "2-Jan", None, "2-Jan", None),   # Johns Hopkins
    179867: ("2-Nov", "4-Jan", "2-Nov", "4-Jan", None),# WashU
    131496: (None, None, "1-Nov", "10-Jan", None),     # Georgetown
    139658: ("1-Nov", "1-Jan", None, "1-Jan", None),   # Emory
    168148: ("2-Nov", "4-Jan", None, "4-Jan", None),   # Tufts
    211440: ("3-Nov", None, None, "5-Jan", None),      # CMU
    152080: (None, None, "1-Nov", "2-Jan", None),      # Notre Dame
    164924: ("1-Nov", "2-Jan", None, "2-Jan", None),   # Boston College
    160755: ("1-Nov", "5-Jan", "10-Nov", "15-Jan", None), # Tulane
    193900: ("1-Nov", "1-Jan", None, "5-Jan", None),   # NYU
    199847: ("15-Nov", "1-Jan", "15-Nov", "1-Jan", "Merit-only for intl"), # Wake Forest
    167358: ("1-Nov", "1-Jan", "1-Nov", "1-Jan", None),# Northeastern
    123961: ("1-Nov", None, "1-Nov", "10-Jan", None),  # USC
    121345: ("15-Nov", "15-Jan", None, "15-Jan", None),# Pomona
    153384: ("15-Nov", "5-Jan", None, "15-Jan", None), # Grinnell
    198385: ("15-Nov", "5-Jan", None, "12-Jan", None), # Davidson
    112260: ("1-Nov", "10-Jan", None, "10-Jan", None), # Claremont McKenna
    230959: ("1-Nov", "3-Jan", None, "3-Jan", None),   # Middlebury
    161086: ("15-Nov", "5-Jan", None, "5-Jan", None),  # Colby
    160977: ("15-Nov", "10-Jan", None, "10-Jan", None),# Bates
    190099: ("1-Nov", "15-Jan", None, "15-Jan", None), # Colgate
    191515: ("15-Nov", "5-Jan", None, "5-Jan", None),  # Hamilton
    204501: ("1-Nov", "2-Jan", None, "15-Jan", None),  # Oberlin
    203535: ("15-Nov", "15-Jan", None, "15-Jan", None),# Kenyon
    195526: ("1-Nov", "8-Jan", None, "8-Jan", None),   # Skidmore
    213385: ("1-Nov", "5-Jan", None, "5-Jan", None),   # Lafayette
    213543: ("1-Nov", "5-Jan", None, "5-Jan", None),   # Lehigh
    232566: ("1-Nov", None, "1-Nov", "1-Jan", None),   # U of Richmond
    173902: ("1-Nov", "1-Jan", "1-Nov", "15-Jan", None),# Macalester
    164580: ("1-Nov", "2-Jan", "1-Nov", "2-Jan", None),# Babson
    201645: ("1-Nov", "15-Jan", "1-Nov", "15-Jan", None),# Case Western
    202523: ("15-Nov", "15-Jan", None, "15-Jan", None),# Denison
    212009: ("1-Nov", "15-Jan", None, "15-Jan", None), # Dickinson
    212984: ("15-Nov", "15-Jan", None, "15-Jan", None),# Franklin & Marshall
    130590: ("15-Nov", "15-Jan", None, "15-Jan", None),# Trinity College CT
    128902: ("1-Nov", "15-Jan", "1-Nov", "15-Jan", None),# Connecticut College
    212674: ("15-Nov", "15-Jan", "1-Dec", "15-Jan", None),# Gettysburg
    209551: (None, None, "1-Nov", "15-Jan", "ICSP scholarship program"),# U of Oregon
    198516: ("1-Nov", None, "1-Nov", "10-Jan", None),  # Elon
    198695: ("Rolling", None, None, "Rolling", None),  # High Point
    136950: ("1-Nov", "5-Jan", "15-Nov", "1-Feb", None),# Rollins
    137546: ("Rolling", None, None, "Rolling", None),  # Stetson
    233426: ("Rolling", None, None, "Rolling", None),  # Roanoke
    133492: ("Rolling", None, None, "Rolling", None),  # Eckerd
    134079: ("Rolling", None, None, "Rolling", None),  # Florida Southern
    140447: (None, None, "1-Nov", "1-Feb", None),      # Mercer
    219709: ("Rolling", None, None, "Rolling", None),  # Belmont
    137847: ("Rolling", None, None, "Rolling", None),  # U of Tampa
    216278: ("Rolling", None, None, "Rolling", None),  # Susquehanna
    164270: ("Rolling", None, None, "Rolling", None),  # McDaniel
    232609: ("Rolling", None, None, "Rolling", None),  # U of Lynchburg
    211088: ("Rolling", None, None, "Rolling", None),  # Arcadia
    191533: ("Rolling", None, None, "Rolling", None),  # Hartwick
    198215: ("Rolling", None, None, "Rolling", None),  # Catawba
    218973: ("1-Nov", None, "15-Nov", "15-Jan", None), # Wofford
    175980: ("Rolling", None, None, "Rolling", None),  # Millsaps
    220710: ("Rolling", None, None, "Rolling", None),  # Maryville
    198835: ("Rolling", None, None, "Rolling", None),  # Lenoir-Rhyne
    106342: ("Rolling", None, None, "Rolling", None),  # Lyon
    231651: ("Rolling", None, None, "Rolling", None),  # Marymount
    158477: ("Rolling", None, None, "Rolling", None),  # Centenary
    218724: ("15-Oct", None, "15-Nov", "1-Feb", None), # Coastal Carolina
    232256: ("1-Dec", "1-Dec", "15-Oct", "1-Feb", None),# Hampden-Sydney
    139144: (None, None, "1-Nov", "Rolling", None),    # Berry
    100751: (None, None, None, "Rolling", None),       # U of Alabama
    176017: (None, None, None, "Rolling", None),       # U of Mississippi
    168254: (None, None, None, "Rolling", None),       # Western New England
    187648: (None, None, None, "Rolling", "Open admission"),
    200253: (None, None, None, "Rolling", "Open admission"),
    200572: (None, None, None, "Rolling", "Open admission"),
    161235: (None, None, None, "Rolling", "Open admission"),
    200059: (None, None, None, "Rolling", "Open admission"),
    200226: (None, None, None, "Rolling", "Open admission"),
    161341: (None, None, None, "Rolling", "Open admission"),
    173124: (None, None, None, "Rolling", "Open admission"),
    180692: (None, None, None, "Rolling", "Open admission"),
    219082: (None, None, None, "Rolling", "Open admission"),  # Dakota State
    181534: (None, None, None, "Rolling", "Open admission"),
    207722: (None, None, None, "Rolling", "Open admission"),  # USAO
    237215: (None, None, None, "Rolling", "Open admission"),
    237057: (None, None, None, "Rolling", "Open admission"),  # Concord
    237385: (None, None, None, "Rolling", "Open admission"),
    237899: (None, None, None, "Rolling", "Open admission"),
    237792: (None, None, None, "Rolling", "Open admission"),
}

updated = 0
not_found = []

for scorecard_id, (ed1, ed2, ea, rd, notes) in DEADLINES_BY_ID.items():
    row = {
        "deadline_ed1": ed1,
        "deadline_ed2": ed2,
        "deadline_ea": ea,
        "deadline_rd": rd,
        "deadline_notes": notes,
    }
    result = supabase.table("universities").update(row).eq("scorecard_id", scorecard_id).execute()
    if result.data:
        updated += 1
    else:
        not_found.append(scorecard_id)

print(f"Обновлено: {updated}/{len(DEADLINES_BY_ID)}")
if not_found:
    print(f"Не найдено в базе (scorecard_id): {not_found}")
else:
    print("Все дедлайны залиты успешно.")
