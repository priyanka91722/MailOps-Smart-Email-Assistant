package com.mailops.api;

import com.mailops.email.EmailReplyRequest;
import com.mailops.email.EmailReplyResponse;
import com.mailops.email.EmailReplyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/emails")
public class EmailReplyController {
    private final EmailReplyService emailReplyService;

    public EmailReplyController(EmailReplyService emailReplyService) {
        this.emailReplyService = emailReplyService;
    }

    @PostMapping("/generate-reply")
    public EmailReplyResponse generateReply(@Valid @RequestBody EmailReplyRequest request) {
        return emailReplyService.generateReply(request);
    }
}
