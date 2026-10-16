package com.mailops.email;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EmailReplyRequest(
        @NotBlank(message = "Paste the email you want to reply to.")
        @Size(max = 20000, message = "Email content must be 20,000 characters or fewer.")
        String emailContent,
        @NotNull(message = "Choose a reply tone.")
        ReplyTone tone,
        @NotNull(message = "Choose a reply length.")
        ReplyLength length,
        @Size(max = 2000, message = "Additional instructions must be 2,000 characters or fewer.")
        String additionalInstructions) {
}
