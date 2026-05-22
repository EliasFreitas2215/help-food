import smtplib
from email.message import EmailMessage
from .config import settings

def send_verification_email(to_email: str, verify_link: str):
    # Se SMTP não estiver configurado (DEV), não falha o cadastro.
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASS or not settings.SMTP_FROM:
        print("[email] SMTP não configurado. Ignorando envio de e-mail de verificação.")
        print(f"[email] Link de verificação (DEV): {verify_link}")
        return

    msg = EmailMessage()
    msg["Subject"] = "Help Food - Confirme seu e-mail"
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg.set_content(
        f"Olá!\n\nPara confirmar seu e-mail, acesse o link:\n{verify_link}\n\n"
        "Se você não solicitou, ignore esta mensagem."
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.send_message(msg)

# Backward-compatible alias
send_confirmation_email = send_verification_email
