//import useful modules
const express = require("express");
const personnelRouter = express.Router();
const module_PersonnelsSchema = require("../models/personnels.js");
const module_companiesSchema = require("../models/companies.js");

let checkEmptyFieldResult;// just for use 

/**
 * create new user 
 * add created user to database
 */
personnelRouter.post("/", function (req, res) {

    checkEmptyFieldResult = isEmptyField(req.body);//check for empty field
    if(checkEmptyFieldResult === true)
    {
        res.status(400).send("empty field");
    }
    else
    {
        //check exist company
        module_companiesSchema.findById(req.body.company, function (err, indentCompanyData) {
            if(err)
            {
                res.status(500).send("something went wrong in search for exist company: \n" + err)
            }
            else if(!indentCompanyData)
            {
                res.status(404).send("this company dose not exist");
            }
            else
            {
                //check for duplicate users in company
                module_PersonnelsSchema.findOne({$and:[{company: req.body.company}, {codeMelli: req.body.codeMelli}]}, function (err, indentUserData) {
                    if(err)
                    {
                        res.status(500).send("something went wrong in search for exist user: \n" + err)
                    }
                    else if(indentUserData)
                    {
                        //(shortand if/else) => indentUserData.codeMelli === req.body.codeMelli? res.status(400).send("kode melli tekrari") : res.status(400).send("company tekrarist");
                        res.status(400).send("in karbar ghabla dar in company sabtnam karde")
                    }
                    else
                    {
                        const NEW_USER = new module_PersonnelsSchema({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            codeMelli: req.body.codeMelli,
                            gender: req.body.gender,
                            isManager: req.body.isManager,
                            tavallod: req.body.tavallod,
                            company: req.body.company
                        });

                        NEW_USER.save(function (err, newUserData) {
                            if(err)
                            {
                                res.status(500).send("something went wrong in save: \n" + err)
                            }
                            else
                            {
                                res.json(newUserData);
                            }
                        })
                    }
                })
            }
        })
    }
});


//READ
personnelRouter.get("/:filter/:companyID", function (req, res) {
    //sed all personnel to client
    if(req.params.filter === "NoFilter" && req.params.companyID === "all")
    {
        //search for all personnel
        module_PersonnelsSchema.find({}).populate("company", {name: 1}).exec(function (err, allPersonnelData) {
            if(err)
            {
                res.status(500).send("somethings went wrong in search for all personnel: \n" + err)
            }
            else if(!allPersonnelData.length)
            {
                res.status(500).send("hich karbari ni")
            }
            else
            {
                res.json(allPersonnelData);
            }
        })
    }
    else if(req.params.filter === "CompaniesFilter")//filter companies for send indent company personnel to client
    {
        //check for exist company
        module_companiesSchema.findById(req.params.companyID, function (err, existIndentCompanyData) {
            if(err)
            {
                res.status(500).send("something went wrong in search for get exist indent company data in company filter: \n" + err)
            }
            else if(!existIndentCompanyData)
            {
                res.status(404).send("this company dose not exist");
            }
            else
            {
                //search for this company personnel
                module_PersonnelsSchema.find({company: req.params.companyID}).populate("company", {name: 1}).exec(function (err1, personnelsData) {
                    if(err1)
                    {
                        res.status(500).send("something went wrong in search for personnels: \n" + err1)
                    }
                    else
                    {
                        res.json(personnelsData);
                    }
                })
            }
        })
    }
    else if(req.params.filter === "ManagerNameFilter")// filter manager for indent company
    {
        //check for exist company
        module_companiesSchema.findById(req.params.companyID, function (err, existIndentCompanyData) {
            if(err)
            {
                res.status(500).send("wrong in search for exist company in manager filter: \n" + err)
            }
            else if(!existIndentCompanyData)
            {
                res.status(404).send("this company dose not exist");
            }
            else
            {
                //find managers for this company
                module_PersonnelsSchema.find({company: req.params.companyID}, function (err, managerData) {
                    if(err)
                    {
                        res.status(500).send("wrong in search for manager name: \n" + err)
                    }
                    else
                    {
                        let managerList = [];
                        for(let i=0; i<managerData.length; i++)
                        {
                            if(managerData[i].isManager === true)
                            {
                                let fullName = managerData[i].firstName + " " + managerData[i].lastName;
                                managerList.push(fullName);
                            }
                        }
                        if(managerList.length)
                        {
                            res.json(managerList);
                        }
                        else
                        {
                            res.status(404).send("modiri taeen nashode");
                        }
                    }
                })
            }
        })
    }
    else if(req.params.filter === "AgeFilter" && req.params.companyID === "all") //find all personnel with age <20 & >30
    {
        module_PersonnelsSchema.find({tavallod: {$gt: (new Date().getFullYear() - 30).toString(), $lt: (new Date().getFullYear() - 1).toString()}},{"_id":0}).populate("company", {name: 1, _id:0}).exec(function (err, personnelAgeFilteredData) {
            if(err)
            {
                res.send(err)
            }
            else
            {
                res.json(personnelAgeFilteredData)
            }
        })
    }
    else if(req.params.filter === "ManagersFilter" && req.params.companyID === "all")// filter just managers 
    {
        module_PersonnelsSchema.find({isManager: true}).populate("company", {name: 1}).exec(function (err, managersFilteredData) {
            if(err)
            {
                res.status(500).send("wrong ind search for managers: \n" + err)
            }
            else
            {
                res.json(managersFilteredData);
            }
        })
    }
})



//UPDATE
personnelRouter.put("/:userID", function (req, res) {

    checkEmptyFieldResult = isEmptyField(req.body);//check for empty field
    if(checkEmptyFieldResult === true)
    {
        res.status(400).send("empty field");
    }
    else
    {
        //find this user
        module_PersonnelsSchema.findOne({_id: req.params.userID}, function (err, indentUserData) {
            if(err)
            {
                res.status(500).send("error in update: \n" + err)
            }
            else if(!indentUserData)
            {
                res.status(404).send("karbari ba in id vojod nadarad")
            }
            else
            {
                //check for exist company thad client set to this personnel company
                module_companiesSchema.findById(req.body.company, function (err, existThisCompany) {
                    if(err)
                    {
                        res.status(500).send("error in serach for user company: \n" + err);
                    }
                    else if(!existThisCompany)
                    {
                        res.status(404).send("kompaniye in karbar sabt nashode");
                    }
                    else//update 
                    {
                        //change info
                        indentUserData.firstName = req.body.firstName;
                        indentUserData.lastName = req.body.lastName;
                        indentUserData.codeMelli = req.body.codeMelli;
                        indentUserData.gender = req.body.gender;
                        indentUserData.isManager = req.body.isManager;
                        indentUserData.tavallod = req.body.tavallod;
                        indentUserData.company = req.body.company;

                        //save new information for update
                        indentUserData.save(function (err, updateUserData) {
                            if(err)
                            {
                                res.status(500).send("err in update: \n" + err)
                            }
                            else
                            {
                                res.json(updateUserData)
                            }
                        })
                    }
                })
            }
        });
    }

});



//DELETE
personnelRouter.delete("/:userDeleteID", function (req, res) {
    //check for exist use and delete
    module_PersonnelsSchema.findByIdAndDelete(req.params.userDeleteID, function (err1, existDeleteUserData) {
        if(err1)
        {
            res.status(500).send("err in search for delete: \n" + err1)
        }
        else if(!existDeleteUserData)
        {
            res.status(404).send("vojod nadare k hazf konam")
        }
        else
        {
            res.send("deleted: \n" + existDeleteUserData)
        }
    })
});

//check for empty field
function isEmptyField(body_request) {
    if(!body_request.firstName || !body_request.lastName || !body_request.codeMelli || !body_request.gender || !body_request.tavallod || !body_request.company)
    {
        return true;
    }
    return false
}

module.exports = personnelRouter;