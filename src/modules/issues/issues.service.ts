import { pool } from "../../db/db";
import type { TIssue } from "../../type/type";

// create issues into database
const createIssuesIntoDb = async (payload: TIssue, body: any) => {
  const { title, description, type } = body;
  // create issue
  const result = await pool.query(
    `
       INSERT INTO issues(title,description,type,reporter_id) 
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
    [title, description, type, payload?.id],
  );

  return result;
};



// get all issues by filtering 
const getAllIssuesFromDb=async(sort:string,type:string,status:string)=>{
    //akhane first a ami akta initial query nilam 
    let query=`
        SELECT *FROM issues WHERE 1=1
        `
        if (type) {
          query += ` AND type='${type}'`;
        }

        if (status) {
          query += ` AND status='${status}'`;
        }
        if(sort=='oldest'){
            query+=`ORDER BY created_at ASC`
        }
        if(sort=='newest'){
            query+=`ORDER BY created_at DESC`
        }
        const result=await pool.query(query)
        const issues = result.rows;
       let finalIssue=[];
       for(const issue of issues){
        const reporter=await pool.query(`
            SELECT * FROM users WHERE id=$1
            `,[issue?.reporter_id])
            
            finalIssue.push({
              id: issue?.id,
              title: issue?.title,
              description: issue?.description,
              type: issue?.type,
              status: issue?.status,

              reporter: {
                id: reporter.rows[0].id,
                name: reporter.rows[0].name,
                role: reporter.rows[0].role
              },
              created_at: issue?.created_at,
              updated_at: issue?.updated_at,
            });
       }
       return finalIssue;
        
    
}


// get single issues by id 

const getSingleIssuesFromDb=async(id:any)=>{
    //akhane first a ami akta initial query nilam 
    
        const result=await pool.query(`
            SELECT * FROM issues WHERE id=$1
            `,[id])
            const issue = result.rows[0];
         const reporterId = result.rows[0].reporter_id;
         const reporter=await pool.query(`
            SELECT *FROM users WHERE id=$1
            `,[reporterId])
            console.log(reporter)
       
    return {
      id: issue?.id,
      title: issue?.title,
      description: issue?.description,
      type: issue?.type,
      status: issue?.status,
      reporter: {
        id: reporter.rows[0].id,
        name: reporter.rows[0].name,
        role: reporter.rows[0].role,
      },
      created_at: issue?.created_at,
      updated_at: issue?.updated_at,
    };
      
       
        
    
}


// delete single issues 
const updateSingleIssuesFromDb = async (payload:any,id: any) => {
  //akhane first a ami akta initial query nilam
  const {title,description,type}=payload

  const result = await pool.query(
    `
            UPDATE issues SET title=$1,description=$2,type=$3 WHERE id=$4 RETURNING *
            `,
    [title, description, type, id],
  );


  return result;
  
  

 

};

export const issuesService={
    createIssuesIntoDb,
    getAllIssuesFromDb,
    getSingleIssuesFromDb,
   updateSingleIssuesFromDb,
}
