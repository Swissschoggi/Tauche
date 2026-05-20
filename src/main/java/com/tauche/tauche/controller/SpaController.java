package com.tauche.tauche.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {


    @RequestMapping(value = {
        "/",
        "/{path:^(?!api|uploads|static|assets)[^\\.]*$}",
        "/{path:^(?!api|uploads|static|assets)[^\\.]*$}/**"
    })
    public String forwardToSpa() {
        return "forward:/index.html";
    }
}