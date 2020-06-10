//import useful modules
const express = require("express");
const companyRouter = express.Router();
const path = require("path");
const module_companiesSchema = require("../models/companies.js");
const module_PersonnelsSchema = require("../models/personnels.js");

let checkEmptyFieldResult;

/**
 * create company
 * add ot database
 */
companyRouter.post("/", function (req, res) {
    checkEmptyFieldResult = isEmptyField(req.body);//check for empty field
    if(checkEmptyFieldResult === true)
    {
        res.status(400).send("empty field");
    }
    else
    {
        module_companiesSchema.findOne({$or:[{name: req.body.name.trim()}, {shomareSabt: req.body.shomareSabt}]}, function (err, indentCompanyData) {
            if(err)
            {
                res.status(500).send("something went wrong in search: \n" + err)
            }
            else if(indentCompanyData)
            {
                res.status(406).send("ghablan sabt shode: \n"+ indentCompanyData)
            }
            else
            {
                //create new company of schema
                const NEW_COMPANY = new module_companiesSchema({
                    name: req.body.name,
                    shomareSabt: req.body.shomareSabt,
                    city: req.body.city,
                    ostan: req.body.ostan,
                    created_at: req.body.created_at,
                    phoneNumber: req.body.phoneNumber
                });

                //save to data base
                NEW_COMPANY.save(function (err1, newCompanyData) {
                    if(err1)
                    {
                        res.status(500).send("something went wrong in save: \n" + err1)
                    }
                    else
                    {
                        res.json(newCompanyData);
                    }
                })
            }
        })
    }
});



companyRouter.get("/:filter/:CompanyID", function (req, res) {
    //all company for send
    if(req.params.filter === "NoFilter" && req.params.CompanyID === "all")
    {
        module_companiesSchema.find({}, function (err, allCompanyData) {
            if(err)
            {
                res.status(500).send("error in search for all company: \n" + err)
            }
            else
            {
                res.json(allCompanyData);
            }
        })
    }
    else if(req.params.filter === "CreatedDateFilter" && req.params.CompanyID === "all")
    {
        let filterYear = (new Date().getFullYear() - 1).toString();//convert to string for filter 
        module_companiesSchema.find({created_at: {$gte : filterYear}}, function (err, allCompaniesData) {
            if(err)
            {
                res.status(500).send("error in filter companies: \n" + err)
            }
            else
            {
                res.json(allCompaniesData);
            }
        })
    }
    else if(req.params.filter === "CompaniesWithManagerName" && req.params.CompanyID === "all")//get companies whit this managers name
    {
        module_companiesSchema.find({}, function (err, companiesManagerNameData) {
            if(err)
            {
                res.status(500).send("error in search for all companies with manager name")
            }
            else
            {
                let companiesAndManagers = [];
                for(let i=0 ;i<companiesManagerNameData.length; i++)
                {
                    module_PersonnelsSchema.find({$and: [{isManager: true}, {company: companiesManagerNameData[i]._id}]}, function (err, nameManagers) {
                        if(err)
                        {
                            res.status(500).send("error in search for managers name: \n" + err)
                        }
                        else
                        {
                            //create text of names managers whithout arr
                            let names = "";
                            for(let j=0; j<nameManagers.length; j++)
                            {
                                names = names + " / " + (nameManagers[j].firstName + " " + nameManagers[j].lastName);
                            }
                            if(names === "")
                            {
                                names = "modiri nadarad";
                            }
                            companiesAndManagers.push(companiesManagerNameData[i].name + ": " + names);
                            if(i === companiesManagerNameData.length-1)
                            {
                                if(companiesAndManagers.length)
                                {
                                    res.json(companiesAndManagers);
                                }
                                else
                                {
                                    res.status(500).send("hich company vojod naddarad");
                                }
                            }
                        }
                    })
                }
            }
        })
    }
});



//UPDATE
companyRouter.put("/:filter/:CompanyID", function (req, res) {

    if(req.params.filter === "UpdateCity" && req.params.CompanyID === "all")
    {
        module_companiesSchema.updateMany({},{city: "tehran1"}, function (err, updatedData) {
            if(err)
            {
                res.status(500).send("error in update all: \n" + err)
            }
            else
            {
                res.json(updatedData);
            }
        });
    }
    else if(req.params.filter === "NoFilter")
    {
        checkEmptyFieldResult = isEmptyField(req.body);//check for empty field
        if(checkEmptyFieldResult === true)
        {
            res.status(400).send("empty field");
        }
        else
        {
            module_companiesSchema.findById(req.params.CompanyID, function (err, existCompany) {
                if(err)
                {
                    res.status(500).send("erron in search for this company: \n" + err);
                }
                else if(!existCompany)
                {
                    res.status(404).send("not exist this company");
                }
                else
                {
                    existCompany.name = req.body.name;
                    existCompany.shomareSabt = req.body.shomareSabt;
                    existCompany.city = req.body.city;
                    existCompany.ostan = req.body.ostan;
                    existCompany.created_at = req.body.created_at;
                    existCompany.phoneNumber = req.body.phoneNumber;
    
                    //save new info insted last info
                    existCompany.save(function (err1, newInfoCompany) {
                        if(err)
                        {
                            res.status(500).send("error in save new info: \n");
                        }
                        else
                        {
                            res.json("ok: \n" + existCompany);
                        }
                    })
                }
            })
        }
    }
});



companyRouter.delete("/:CompanyDeleteID", function (req, res) {
    //check exist this company
    module_companiesSchema.findByIdAndDelete(req.params.CompanyDeleteID, function (err, existThisCompany) {
        if(err)
        {
            res.status(500).send("err in delete company" + err);
        }
        else if(!existThisCompany)
        {
            res.status(404).send("company baraye hazf vojod nadarad" + err);
        }
        else
        {
            res.send("hazf shod: \n" + existThisCompany);
        }
    })
})


//check for empty field
function isEmptyField(body_request) {
    if(!body_request.name || !body_request.shomareSabt || !body_request.city || !body_request.ostan || !body_request.phoneNumber)
    {
        return true;
    }
    return false
}


module.exports = companyRouter;