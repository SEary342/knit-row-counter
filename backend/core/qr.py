import json
from io import BytesIO

import qrcode


def generate_project_qr(project_data: dict) -> BytesIO:
    """
    Converts project dictionary to a JSON string and encodes it into a QR code.
    Returns a BytesIO object containing the PNG image.
    """
    # We serialize the dict to a compact JSON string
    data_string = json.dumps(project_data, separators=(",", ":"))

    qr = qrcode.QRCode(
        version=None,  # Automatically scales based on data size
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data_string)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf
