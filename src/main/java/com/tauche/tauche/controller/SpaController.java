package com.tauche.tauche.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
        "/{path:[^\\.]*}", 
        "/{path:^(?!api|static|js|css|img|images).*$}/{path:[^\\.]*}"
    })
    public String redirect() {
        return "forward:/index.html";
    }
}